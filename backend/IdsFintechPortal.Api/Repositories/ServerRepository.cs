using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class ServerRepository : IServerRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ServerRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<ServerResponse>> GetAllAsync()
    {
        const string sql = """
            SELECT
                s.Id,
                s.EnvironmentId,
                e.Name AS EnvironmentName,

                e.DeploymentId,

                d.ClientId,
                c.CompanyName AS ClientName,

                d.ProductId,
                p.Name AS ProductName,

                s.ServerName,
                s.Hostname,
                s.IpAddress,
                s.ServerType,
                s.OperatingSystem,
                s.Purpose,
                s.AccessMethod,
                s.AccessReference,
                s.Notes,
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt

            FROM Servers s

            INNER JOIN Environments e
                ON s.EnvironmentId = e.Id

            INNER JOIN Deployments d
                ON e.DeploymentId = d.Id

            INNER JOIN Clients c
                ON d.ClientId = c.Id

            INNER JOIN Products p
                ON d.ProductId = p.Id

            ORDER BY
                c.CompanyName,
                p.Name,
                e.Name,
                s.ServerName;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<ServerResponse>(sql);
    }

    public async Task<ServerResponse?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                s.Id,
                s.EnvironmentId,
                e.Name AS EnvironmentName,

                e.DeploymentId,

                d.ClientId,
                c.CompanyName AS ClientName,

                d.ProductId,
                p.Name AS ProductName,

                s.ServerName,
                s.Hostname,
                s.IpAddress,
                s.ServerType,
                s.OperatingSystem,
                s.Purpose,
                s.AccessMethod,
                s.AccessReference,
                s.Notes,
                s.IsActive,
                s.CreatedAt,
                s.UpdatedAt

            FROM Servers s

            INNER JOIN Environments e
                ON s.EnvironmentId = e.Id

            INNER JOIN Deployments d
                ON e.DeploymentId = d.Id

            INNER JOIN Clients c
                ON d.ClientId = c.Id

            INNER JOIN Products p
                ON d.ProductId = p.Id

            WHERE s.Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<ServerResponse>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateServerRequest request)
    {
        const string sql = """
            INSERT INTO Servers
            (
                EnvironmentId,
                ServerName,
                Hostname,
                IpAddress,
                ServerType,
                OperatingSystem,
                Purpose,
                AccessMethod,
                AccessReference,
                Notes,
                IsActive
            )
            VALUES
            (
                @EnvironmentId,
                @ServerName,
                @Hostname,
                @IpAddress,
                @ServerType,
                @OperatingSystem,
                @Purpose,
                @AccessMethod,
                @AccessReference,
                @Notes,
                @IsActive
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            sql,
            request
        );
    }

    public async Task<bool> UpdateAsync(
        int id,
        UpdateServerRequest request)
    {
        const string sql = """
            UPDATE Servers
            SET
                EnvironmentId = @EnvironmentId,
                ServerName = @ServerName,
                Hostname = @Hostname,
                IpAddress = @IpAddress,
                ServerType = @ServerType,
                OperatingSystem = @OperatingSystem,
                Purpose = @Purpose,
                AccessMethod = @AccessMethod,
                AccessReference = @AccessReference,
                Notes = @Notes,
                IsActive = @IsActive,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.EnvironmentId,
                request.ServerName,
                request.Hostname,
                request.IpAddress,
                request.ServerType,
                request.OperatingSystem,
                request.Purpose,
                request.AccessMethod,
                request.AccessReference,
                request.Notes,
                request.IsActive
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Servers
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new { Id = id }
        );

        return rowsAffected > 0;
    }
}