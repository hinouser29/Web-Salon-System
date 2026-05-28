import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class WipeDb {
    public static void main(String[] args) {
        String url = System.getenv().getOrDefault("DB_URL", "jdbc:postgresql://localhost:5432/spa_management");
        String user = System.getenv().getOrDefault("DB_USERNAME", "postgres");
        String password = System.getenv().getOrDefault("DB_PASSWORD", "postgres");

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Dropping schema public cascade...");
            stmt.execute("DROP SCHEMA public CASCADE;");
            
            System.out.println("Recreating schema public...");
            stmt.execute("CREATE SCHEMA public;");
            
            System.out.println("Granting privileges...");
            stmt.execute("GRANT ALL ON SCHEMA public TO postgres;");
            stmt.execute("GRANT ALL ON SCHEMA public TO public;");
            
            System.out.println("Database reset successful.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
