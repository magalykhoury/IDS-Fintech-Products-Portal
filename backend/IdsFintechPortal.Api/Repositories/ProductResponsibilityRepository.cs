using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class ProductResponsibilityRepository : IProductResponsibilityRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ProductResponsibilityRepository(
        DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    // --------------------------------------------------
    // GET PRODUCT RESPONSIBILITIES
    // --------------------------------------------------

    public async Task<IEnumerable<ProductResponsibilityResponse>>
        GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT
                pr.Id,
                pr.ProductId,
                p.Name AS ProductName,
                pr.TeamMemberId,
                tm.FullName AS TeamMemberName,
                pr.Responsibility,
                pr.Description,
                pr.CreatedAt
            FROM ProductResponsibilities pr

            INNER JOIN Products p
                ON pr.ProductId = p.Id

            INNER JOIN TeamMembers tm
                ON pr.TeamMemberId = tm.Id

            WHERE pr.ProductId = @ProductId

            ORDER BY
                pr.Responsibility,
                tm.FullName;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<ProductResponsibilityResponse>(
            sql,
            new
            {
                ProductId = productId
            }
        );
    }

    // --------------------------------------------------
    // CREATE PRODUCT RESPONSIBILITY
    // --------------------------------------------------

    public async Task<int> CreateAsync(
        CreateProductResponsibilityRequest request)
    {
        const string sql = """
            INSERT INTO ProductResponsibilities
            (
                ProductId,
                TeamMemberId,
                Responsibility,
                Description
            )
            VALUES
            (
                @ProductId,
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

    // --------------------------------------------------
    // UPDATE PRODUCT RESPONSIBILITY
    // --------------------------------------------------

    public async Task<bool> UpdateAsync(
        int id,
        CreateProductResponsibilityRequest request)
    {
        const string sql = """
            UPDATE ProductResponsibilities
            SET
                ProductId = @ProductId,
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
                    request.ProductId,
                    request.TeamMemberId,
                    request.Responsibility,
                    request.Description
                }
            );

        return rowsAffected > 0;
    }

    // --------------------------------------------------
    // DELETE PRODUCT RESPONSIBILITY
    // --------------------------------------------------

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM ProductResponsibilities
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected =
            await connection.ExecuteAsync(
                sql,
                new
                {
                    Id = id
                }
            );

        return rowsAffected > 0;
    }
}