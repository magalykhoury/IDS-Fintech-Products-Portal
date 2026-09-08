using Microsoft.Data.SqlClient;
using System.Data;

namespace IdsFintechPortal.Api.Data;

public class DbConnectionFactory
{
    private readonly IConfiguration _configuration;

    public DbConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public IDbConnection CreateConnection()
    {
        var connectionString =
            _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection is missing. Configure it with user secrets or an environment variable."
            );

        return new SqlConnection(connectionString);
    }
}
