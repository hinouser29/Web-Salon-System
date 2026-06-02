import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckDb {
    public static void main(String[] args) {
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require");
        String user = System.getenv().getOrDefault("DB_USERNAME", "postgres.mzljkjbzzgyvdtaweuuh");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "Salonsystem123@");

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Checking flyway_schema_history:");
            try (ResultSet rs = stmt.executeQuery("SELECT version, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 3")) {
                while(rs.next()) {
                    System.out.println("Version: " + rs.getString("version") + " | Success: " + rs.getBoolean("success"));
                }
            } catch(Exception e) {
                System.out.println("flyway_schema_history not found or error");
            }

            System.out.println("\nChecking users count:");
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM users")) {
                if(rs.next()) {
                    System.out.println("Users count: " + rs.getInt(1));
                }
            }

            System.out.println("\nChecking employees count:");
            try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM employees")) {
                if(rs.next()) {
                    System.out.println("Employees count: " + rs.getInt(1));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
