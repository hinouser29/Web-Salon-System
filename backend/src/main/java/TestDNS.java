import java.net.InetAddress;
public class TestDNS {
    public static void main(String[] args) throws Exception {
        InetAddress[] addresses = InetAddress.getAllByName("db.mzljkjbzzgyvdtaweuuh.supabase.co");
        for (InetAddress addr : addresses) {
            System.out.println(addr.getHostAddress());
        }
    }
}
