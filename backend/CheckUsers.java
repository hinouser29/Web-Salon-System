import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckUsers {
    public static void main(String[] args) {
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require");
        String user = System.getenv().getOrDefault("DB_USERNAME", "postgres.mzljkjbzzgyvdtaweuuh");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "Salonsystem123@");

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Checking users:");
            try (ResultSet rs = stmt.executeQuery("SELECT email, password, role FROM users")) {
                while(rs.next()) {
                    System.out.println("Email: " + rs.getString("email") + " | Pass: " + rs.getString("password") + " | Role: " + rs.getString("role"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
