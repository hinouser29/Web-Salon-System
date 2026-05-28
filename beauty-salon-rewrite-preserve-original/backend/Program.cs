using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Dapper;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Npgsql;

Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null;
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "dev_secret_key_change_me";
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton(_ =>
{
    var connectionString = builder.Configuration.GetConnectionString("PostgreSql")
        ?? throw new InvalidOperationException("Missing ConnectionStrings:PostgreSql.");
    return NpgsqlDataSource.Create(connectionString);
});

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CustomerService>();
builder.Services.AddScoped<MailService>();
builder.Services.AddScoped<CatalogService>();

var app = builder.Build();

app.UseCors();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Json(new { message = "Beauty Salon Management API" }));

var auth = app.MapGroup("/api/auth");
auth.MapPost("/register", async (RegisterRequest request, AuthService service) =>
    await HandlePlain(() => service.RegisterAsync(request)));
auth.MapPost("/verify-email", async (VerifyEmailRequest request, AuthService service) =>
    await HandlePlain(() => service.VerifyEmailAsync(request.Email, request.Code)));
auth.MapPost("/resend-verify-code", async (EmailRequest request, AuthService service) =>
    await HandlePlain(() => service.ResendVerifyCodeAsync(request.Email)));
auth.MapPost("/login", async (LoginRequest request, AuthService service) =>
    await HandlePlain(() => service.LoginAsync(request.Email, request.Password)));
auth.MapPost("/google-login", async (GoogleLoginRequest request, AuthService service) =>
    await HandlePlain(() => service.GoogleLoginAsync(request.IdToken)));
auth.MapPost("/logout", () => Results.Json(new { message = "Dang xuat thanh cong" })).RequireAuthorization();
auth.MapPut("/change-password", async (ChangePasswordRequest request, ClaimsPrincipal user, AuthService service) =>
    await HandlePlain(() => service.ChangePasswordAsync(GetUserId(user), request.OldPassword, request.NewPassword)))
    .RequireAuthorization();
auth.MapPost("/forgot-password", async (EmailRequest request, AuthService service) =>
    await HandlePlain(() => service.ForgotPasswordAsync(request.Email)));
auth.MapPost("/reset-password", async (ResetPasswordRequest request, AuthService service) =>
    await HandlePlain(() => service.ResetPasswordAsync(request.Token, request.NewPassword)));

var customers = app.MapGroup("/api/customers");
customers.MapGet("/", async (CustomerService service) => await HandleData(() => service.GetAllAsync()));
customers.MapGet("/{id:int}", async (int id, CustomerService service) => await HandleData(() => service.GetByIdAsync(id)));
customers.MapGet("/me/profile", async (ClaimsPrincipal user, CustomerService service) =>
    await HandleData(() => service.GetMyProfileAsync(GetUserId(user)))).RequireAuthorization();
customers.MapPut("/me/profile", async (UpdateProfileRequest request, ClaimsPrincipal user, CustomerService service) =>
    await HandleData(() => service.UpdateMyProfileAsync(GetUserId(user), request), "Cap nhat ho so thanh cong"))
    .RequireAuthorization();
customers.MapPut("/me/avatar", async (HttpRequest request, ClaimsPrincipal user, CustomerService service, IWebHostEnvironment env) =>
{
    if (!request.HasFormContentType) return Results.Json(new { success = false, message = "Vui long chon anh dai dien" }, statusCode: 400);
    var file = request.Form.Files["avatar"];
    if (file is null || file.Length == 0) return Results.Json(new { success = false, message = "Vui long chon anh dai dien" }, statusCode: 400);

    var uploadsDir = Path.Combine(env.WebRootPath, "uploads", "avatars");
    Directory.CreateDirectory(uploadsDir);
    var extension = Path.GetExtension(file.FileName);
    var fileName = $"avatar-{GetUserId(user)}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}{extension}";
    var fullPath = Path.Combine(uploadsDir, fileName);
    await using (var stream = File.Create(fullPath))
    {
        await file.CopyToAsync(stream);
    }

    var avatarUrl = $"/uploads/avatars/{fileName}";
    return await HandleData(() => service.UpdateMyAvatarAsync(GetUserId(user), avatarUrl), "Cap nhat anh dai dien thanh cong");
}).RequireAuthorization();
customers.MapPost("/", async (CreateCustomerRequest request, CustomerService service) =>
    await HandleData(() => service.CreateAsync(request), "Created", 201));
customers.MapPut("/{id:int}", async (int id, UpdateCustomerRequest request, CustomerService service) =>
    await HandleData(() => service.UpdateAsync(id, request), "Updated"));
customers.MapDelete("/{id:int}", async (int id, CustomerService service) =>
    await HandleData(() => service.RemoveAsync(id), "Deleted"));

var services = app.MapGroup("/api/services");
services.MapGet("/", async (CatalogService service) => await HandleData(() => service.GetServicesAsync()));
services.MapGet("/{id:int}", async (int id, CatalogService service) => await HandleData(() => service.GetServiceByIdAsync(id)));
MapReadOnlyCatalog(app, "/api/employees", service => service.GetEmployeesAsync(), (service, id) => service.GetEmployeeByIdAsync(id));

foreach (var route in new[] { "users", "packages", "appointments", "payments", "membership", "notifications", "ai", "reports" })
{
    MapStubCrud(app, $"/api/{route}");
}

app.Run();

static int GetUserId(ClaimsPrincipal user)
{
    var value = user.FindFirstValue("userId") ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
    return int.TryParse(value, out var id) ? id : 0;
}

static async Task<IResult> HandlePlain(Func<Task<object>> action)
{
    try
    {
        return Results.Json(await action());
    }
    catch (Exception ex)
    {
        return Results.Json(new { message = ex.Message }, statusCode: 400);
    }
}

static async Task<IResult> HandleData(Func<Task<object?>> action, string message = "Success", int status = 200)
{
    try
    {
        return Results.Json(new { success = true, message, data = await action() }, statusCode: status);
    }
    catch (Exception ex)
    {
        return Results.Json(new { success = false, message = ex.Message }, statusCode: 400);
    }
}

static void MapReadOnlyCatalog(
    WebApplication app,
    string route,
    Func<CatalogService, Task<object?>> getAll,
    Func<CatalogService, int, Task<object?>> getById)
{
    var group = app.MapGroup(route);
    group.MapGet("/", async (CatalogService service) => await HandleData(() => getAll(service)));
    group.MapGet("/{id:int}", async (int id, CatalogService service) => await HandleData(() => getById(service, id)));
    group.MapPost("/", (JsonElement body) => Results.Json(body));
    group.MapPut("/{id:int}", (int id, JsonElement body) => Results.Json(new { id, body }));
    group.MapDelete("/{id:int}", (int id) => Results.Json(new { id }));
}

static void MapStubCrud(WebApplication app, string route)
{
    var group = app.MapGroup(route);
    group.MapGet("/", () => Results.Json(new object[] { }));
    group.MapGet("/{id:int}", (int id) => Results.Json(new { id }));
    group.MapPost("/", (JsonElement body) => Results.Json(body));
    group.MapPut("/{id:int}", (int id, JsonElement body) => Results.Json(new { id, body }));
    group.MapDelete("/{id:int}", (int id) => Results.Json(new { id }));
}
