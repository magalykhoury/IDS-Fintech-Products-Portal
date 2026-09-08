using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using EnvironmentModel = IdsFintechPortal.Api.Models.Environment;

namespace IdsFintechPortal.Api.Repositories;

public class EnvironmentRepository : IEnvironmentRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public EnvironmentRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<EnvironmentModel>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                DeploymentId,
                Name,
                Type,
                Purpose,
                ApplicationUrl,
                DatabaseInformation,
                MonitoringUrl,
                AccessInstructions,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Environments
            ORDER BY Id DESC;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<EnvironmentModel>(sql);
    }

    public async Task<EnvironmentModel?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                DeploymentId,
                Name,
                Type,
                Purpose,
                ApplicationUrl,
                DatabaseInformation,
                MonitoringUrl,
                AccessInstructions,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Environments
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<EnvironmentModel>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateEnvironmentRequest request)
    {
        const string sql = """
            INSERT INTO Environments
            (
                DeploymentId,
                Name,
                Type,
                Purpose,
                ApplicationUrl,
                DatabaseInformation,
                MonitoringUrl,
                AccessInstructions,
                Notes
            )
            VALUES
            (
                @DeploymentId,
                @Name,
                @Type,
                @Purpose,
                @ApplicationUrl,
                @DatabaseInformation,
                @MonitoringUrl,
                @AccessInstructions,
                @Notes
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
        UpdateEnvironmentRequest request)
    {
        const string sql = """
            UPDATE Environments
            SET
                DeploymentId = @DeploymentId,
                Name = @Name,
                Type = @Type,
                Purpose = @Purpose,
                ApplicationUrl = @ApplicationUrl,
                DatabaseInformation = @DatabaseInformation,
                MonitoringUrl = @MonitoringUrl,
                AccessInstructions = @AccessInstructions,
                Notes = @Notes,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.DeploymentId,
                request.Name,
                request.Type,
                request.Purpose,
                request.ApplicationUrl,
                request.DatabaseInformation,
                request.MonitoringUrl,
                request.AccessInstructions,
                request.Notes
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Environments
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