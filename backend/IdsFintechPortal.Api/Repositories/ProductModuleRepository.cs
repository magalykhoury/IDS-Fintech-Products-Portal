using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class ProductModuleRepository : IProductModuleRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ProductModuleRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<ProductModule>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                Description,
                Status,
                CreatedAt,
                UpdatedAt
            FROM ProductModules
            ORDER BY Name;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<ProductModule>(sql);
    }

    public async Task<ProductModule?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                Description,
                Status,
                CreatedAt,
                UpdatedAt
            FROM ProductModules
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<ProductModule>(
            sql,
            new { Id = id }
        );
    }

    public async Task<IEnumerable<ProductModule>> GetByProductIdAsync(int productId)
    {
        const string sql = """
            SELECT
                Id,
                ProductId,
                Name,
                Description,
                Status,
                CreatedAt,
                UpdatedAt
            FROM ProductModules
            WHERE ProductId = @ProductId
            ORDER BY Name;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<ProductModule>(
            sql,
            new { ProductId = productId }
        );
    }

    public async Task<int> CreateAsync(CreateProductModuleRequest request)
    {
        const string sql = """
            INSERT INTO ProductModules
            (
                ProductId,
                Name,
                Description,
                Status
            )
            VALUES
            (
                @ProductId,
                @Name,
                @Description,
                @Status
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
        UpdateProductModuleRequest request)
    {
        const string sql = """
            UPDATE ProductModules
            SET
                ProductId = @ProductId,
                Name = @Name,
                Description = @Description,
                Status = @Status,
                UpdatedAt = SYSUTCDATETIME()
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        var rowsAffected = await connection.ExecuteAsync(
            sql,
            new
            {
                Id = id,
                request.ProductId,
                request.Name,
                request.Description,
                request.Status
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM ProductModules
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