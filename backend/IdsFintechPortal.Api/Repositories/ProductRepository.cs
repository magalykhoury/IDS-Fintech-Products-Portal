using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ProductRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                Name,
                Description,
                BusinessPurpose,
                LifecycleStatus,
                CurrentVersion,
                SupportedMarkets,
                Criticality,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Products
            ORDER BY Name;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Product>(sql);
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                Name,
                Description,
                BusinessPurpose,
                LifecycleStatus,
                CurrentVersion,
                SupportedMarkets,
                Criticality,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Products
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Product>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateProductRequest request)
    {
        const string sql = """
            INSERT INTO Products
            (
                Name,
                Description,
                BusinessPurpose,
                LifecycleStatus,
                CurrentVersion,
                SupportedMarkets,
                Criticality,
                Notes
            )
            VALUES
            (
                @Name,
                @Description,
                @BusinessPurpose,
                @LifecycleStatus,
                @CurrentVersion,
                @SupportedMarkets,
                @Criticality,
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

    public async Task<bool> UpdateAsync(int id, UpdateProductRequest request)
    {
        const string sql = """
            UPDATE Products
            SET
                Name = @Name,
                Description = @Description,
                BusinessPurpose = @BusinessPurpose,
                LifecycleStatus = @LifecycleStatus,
                CurrentVersion = @CurrentVersion,
                SupportedMarkets = @SupportedMarkets,
                Criticality = @Criticality,
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
                request.Name,
                request.Description,
                request.BusinessPurpose,
                request.LifecycleStatus,
                request.CurrentVersion,
                request.SupportedMarkets,
                request.Criticality,
                request.Notes
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Products
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