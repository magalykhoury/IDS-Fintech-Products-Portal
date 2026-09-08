using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class DeploymentModuleRepository : IDeploymentModuleRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public DeploymentModuleRepository(
        DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<DeploymentModuleResponse>>
        GetByDeploymentIdAsync(int deploymentId)
    {
        const string sql = """
            SELECT
                dm.DeploymentId,
                dm.ProductModuleId,
                pm.Name AS ModuleName,
                pm.Description AS ModuleDescription,
                pm.Status AS ModuleStatus
            FROM DeploymentModules dm
            INNER JOIN ProductModules pm
                ON dm.ProductModuleId = pm.Id
            WHERE dm.DeploymentId = @DeploymentId
            ORDER BY pm.Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<DeploymentModuleResponse>(
            sql,
            new { DeploymentId = deploymentId }
        );
    }

    public async Task<bool> AddAsync(
        int deploymentId,
        int productModuleId)
    {
        const string sql = """
            IF NOT EXISTS
            (
                SELECT 1
                FROM DeploymentModules
                WHERE DeploymentId = @DeploymentId
                  AND ProductModuleId = @ProductModuleId
            )
            BEGIN
                INSERT INTO DeploymentModules
                (
                    DeploymentId,
                    ProductModuleId
                )
                VALUES
                (
                    @DeploymentId,
                    @ProductModuleId
                );
            END
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                DeploymentId = deploymentId,
                ProductModuleId = productModuleId
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> RemoveAsync(
        int deploymentId,
        int productModuleId)
    {
        const string sql = """
            DELETE FROM DeploymentModules
            WHERE DeploymentId = @DeploymentId
              AND ProductModuleId = @ProductModuleId;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                DeploymentId = deploymentId,
                ProductModuleId = productModuleId
            }
        );

        return rowsAffected > 0;
    }
}