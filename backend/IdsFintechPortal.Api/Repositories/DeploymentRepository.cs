using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class DeploymentRepository : IDeploymentRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public DeploymentRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<DeploymentResponse>> GetAllAsync()
    {
        const string sql = """
            SELECT
                d.Id,
                d.ClientId,
                c.CompanyName AS ClientName,
                d.ProductId,
                p.Name AS ProductName,
                d.ProductVersion,
                d.GoLiveDate,
                d.Status,
                d.SupportTier,
                d.ClientSpecificNotes,
                d.CreatedAt,
                d.UpdatedAt
            FROM Deployments d
            INNER JOIN Clients c
                ON d.ClientId = c.Id
            INNER JOIN Products p
                ON d.ProductId = p.Id
            ORDER BY d.Id DESC;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<DeploymentResponse>(sql);
    }

    public async Task<DeploymentResponse?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                d.Id,
                d.ClientId,
                c.CompanyName AS ClientName,
                d.ProductId,
                p.Name AS ProductName,
                d.ProductVersion,
                d.GoLiveDate,
                d.Status,
                d.SupportTier,
                d.ClientSpecificNotes,
                d.CreatedAt,
                d.UpdatedAt
            FROM Deployments d
            INNER JOIN Clients c
                ON d.ClientId = c.Id
            INNER JOIN Products p
                ON d.ProductId = p.Id
            WHERE d.Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<DeploymentResponse>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateDeploymentRequest request)
    {
        const string sql = """
            INSERT INTO Deployments
            (
                ClientId,
                ProductId,
                ProductVersion,
                GoLiveDate,
                Status,
                SupportTier,
                ClientSpecificNotes
            )
            VALUES
            (
                @ClientId,
                @ProductId,
                @ProductVersion,
                @GoLiveDate,
                @Status,
                @SupportTier,
                @ClientSpecificNotes
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
        UpdateDeploymentRequest request)
    {
        const string sql = """
            UPDATE Deployments
            SET
                ClientId = @ClientId,
                ProductId = @ProductId,
                ProductVersion = @ProductVersion,
                GoLiveDate = @GoLiveDate,
                Status = @Status,
                SupportTier = @SupportTier,
                ClientSpecificNotes = @ClientSpecificNotes,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.ClientId,
                request.ProductId,
                request.ProductVersion,
                request.GoLiveDate,
                request.Status,
                request.SupportTier,
                request.ClientSpecificNotes
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Deployments
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