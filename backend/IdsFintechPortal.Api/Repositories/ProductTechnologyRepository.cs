using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public class ProductTechnologyRepository : IProductTechnologyRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ProductTechnologyRepository(
        DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<ProductTechnologyResponse>>
        GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT
                pt.ProductId,
                p.Name AS ProductName,
                pt.TechnologyId,
                t.Name AS TechnologyName,
                t.Description AS TechnologyDescription
            FROM ProductTechnologies pt

            INNER JOIN Products p
                ON pt.ProductId = p.Id

            INNER JOIN Technologies t
                ON pt.TechnologyId = t.Id

            WHERE pt.ProductId = @ProductId

            ORDER BY t.Name;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<ProductTechnologyResponse>(
            sql,
            new { ProductId = productId }
        );
    }

    public async Task<bool> AddAsync(
        int productId,
        int technologyId)
    {
        const string sql = """
            IF NOT EXISTS
            (
                SELECT 1
                FROM ProductTechnologies
                WHERE ProductId = @ProductId
                  AND TechnologyId = @TechnologyId
            )
            BEGIN
                INSERT INTO ProductTechnologies
                (
                    ProductId,
                    TechnologyId
                )
                VALUES
                (
                    @ProductId,
                    @TechnologyId
                );
            END
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                ProductId = productId,
                TechnologyId = technologyId
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> RemoveAsync(
        int productId,
        int technologyId)
    {
        const string sql = """
            DELETE FROM ProductTechnologies
            WHERE ProductId = @ProductId
              AND TechnologyId = @TechnologyId;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                ProductId = productId,
                TechnologyId = technologyId
            }
        );

        return rowsAffected > 0;
    }
}