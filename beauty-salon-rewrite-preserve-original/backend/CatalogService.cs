using Dapper;
using Npgsql;

public sealed class CatalogService(NpgsqlDataSource dataSource)
{
    public async Task<object?> GetServicesAsync()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var rows = await connection.QueryAsync("""
            SELECT
                s.service_id AS "ServiceId",
                s.service_name AS "ServiceName",
                s.description AS "Description",
                s.duration_minutes AS "DurationMinutes",
                s.price AS "Price",
                s.status AS "Status",
                s.image_url AS "ImageUrl",
                c.category_name AS "CategoryName"
            FROM services s
            LEFT JOIN service_categories c ON s.category_id = c.category_id
            WHERE s.status = 'AVAILABLE'
            ORDER BY s.service_id DESC;
            """);
        return rows;
    }

    public async Task<object?> GetServiceByIdAsync(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync("""
            SELECT
                s.service_id AS "ServiceId",
                s.service_name AS "ServiceName",
                s.description AS "Description",
                s.duration_minutes AS "DurationMinutes",
                s.price AS "Price",
                s.status AS "Status",
                s.image_url AS "ImageUrl",
                c.category_name AS "CategoryName"
            FROM services s
            LEFT JOIN service_categories c ON s.category_id = c.category_id
            WHERE s.service_id = @ServiceId;
            """, new { ServiceId = id });
    }

    public async Task<object?> GetEmployeesAsync()
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        var rows = await connection.QueryAsync("""
            SELECT
                e.employee_id AS "EmployeeId",
                u.full_name AS "FullName",
                e.position AS "Position",
                e.specialization AS "Specialization",
                e.image_url AS "ImageUrl",
                e.status AS "Status"
            FROM employees e
            JOIN users u ON e.user_id = u.user_id
            WHERE e.status = 'ACTIVE'
            ORDER BY e.employee_id ASC;
            """);
        return rows;
    }

    public async Task<object?> GetEmployeeByIdAsync(int id)
    {
        await using var connection = await dataSource.OpenConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync("""
            SELECT
                e.employee_id AS "EmployeeId",
                u.full_name AS "FullName",
                e.position AS "Position",
                e.specialization AS "Specialization",
                e.image_url AS "ImageUrl",
                e.status AS "Status"
            FROM employees e
            JOIN users u ON e.user_id = u.user_id
            WHERE e.employee_id = @EmployeeId;
            """, new { EmployeeId = id });
    }
}
