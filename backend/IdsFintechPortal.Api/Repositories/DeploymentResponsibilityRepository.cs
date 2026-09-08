using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class DeploymentResponsibilityRepository
    : IDeploymentResponsibilityRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public DeploymentResponsibilityRepository(
        DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<DeploymentResponsibilityResponse>>
        GetByDeploymentIdAsync(int deploymentId)
    {
        const string sql = """
            SELECT
                dr.Id,
                dr.DeploymentId,

                d.ClientId,
                c.CompanyName AS ClientName,

                d.ProductId,
                p.Name AS ProductName,

                dr.TeamMemberId,
                tm.FullName AS TeamMemberName,

                dr.Responsibility,
                dr.Description,
                dr.CreatedAt

            FROM DeploymentResponsibilities dr

            INNER JOIN Deployments d
                ON dr.DeploymentId = d.Id

            INNER JOIN Clients c
                ON d.ClientId = c.Id

            INNER JOIN Products p
                ON d.ProductId = p.Id

            INNER JOIN TeamMembers tm
                ON dr.TeamMemberId = tm.Id

            WHERE dr.DeploymentId = @DeploymentId

            ORDER BY
                dr.Responsibility,
                tm.FullName;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection
            .QueryAsync<DeploymentResponsibilityResponse>(
                sql,
                new { DeploymentId = deploymentId }
            );
    }

    public async Task<int> CreateAsync(
        CreateDeploymentResponsibilityRequest request)
    {
        const string sql = """
            INSERT INTO DeploymentResponsibilities
            (
                DeploymentId,
                TeamMemberId,
                Responsibility,
                Description
            )
            VALUES
            (
                @DeploymentId,
                @TeamMemberId,
                @Responsibility,
                @Description
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            sql,
            request
        );
    }

    public async Task<bool> UpdateAsync(
        int id,
        CreateDeploymentResponsibilityRequest request)
    {
        const string sql = """
            UPDATE DeploymentResponsibilities
            SET
                DeploymentId = @DeploymentId,
                TeamMemberId = @TeamMemberId,
                Responsibility = @Responsibility,
                Description = @Description
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected =
            await connection.ExecuteAsync(
                sql,
                new
                {
                    Id = id,
                    request.DeploymentId,
                    request.TeamMemberId,
                    request.Responsibility,
                    request.Description
                }
            );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM DeploymentResponsibilities
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected =
            await connection.ExecuteAsync(
                sql,
                new { Id = id }
            );

        return rowsAffected > 0;
    }
}