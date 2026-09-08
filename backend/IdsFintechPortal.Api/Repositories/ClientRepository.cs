using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class ClientRepository : IClientRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public ClientRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    public async Task<IEnumerable<Client>> GetAllAsync()
    {
        const string sql = """
            SELECT
                Id,
                CompanyName,
                Country,
                ContactName,
                ContactEmail,
                ContactPhone,
                Status,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Clients
            ORDER BY CompanyName;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<Client>(sql);
    }

    public async Task<Client?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                CompanyName,
                Country,
                ContactName,
                ContactEmail,
                ContactPhone,
                Status,
                Notes,
                CreatedAt,
                UpdatedAt
            FROM Clients
            WHERE Id = @Id;
            """;

        using var connection = _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<Client>(
            sql,
            new { Id = id }
        );
    }

    public async Task<int> CreateAsync(CreateClientRequest request)
    {
        const string sql = """
            INSERT INTO Clients
            (
                CompanyName,
                Country,
                ContactName,
                ContactEmail,
                ContactPhone,
                Status,
                Notes
            )
            VALUES
            (
                @CompanyName,
                @Country,
                @ContactName,
                @ContactEmail,
                @ContactPhone,
                @Status,
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

    public async Task<bool> UpdateAsync(int id, UpdateClientRequest request)
    {
        const string sql = """
            UPDATE Clients
            SET
                CompanyName = @CompanyName,
                Country = @Country,
                ContactName = @ContactName,
                ContactEmail = @ContactEmail,
                ContactPhone = @ContactPhone,
                Status = @Status,
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
                request.CompanyName,
                request.Country,
                request.ContactName,
                request.ContactEmail,
                request.ContactPhone,
                request.Status,
                request.Notes
            }
        );

        return rowsAffected > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = """
            DELETE FROM Clients
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