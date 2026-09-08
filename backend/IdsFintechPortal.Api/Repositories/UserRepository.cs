using Dapper;
using IdsFintechPortal.Api.Data;
using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DbConnectionFactory _dbConnectionFactory;

    public UserRepository(DbConnectionFactory dbConnectionFactory)
    {
        _dbConnectionFactory = dbConnectionFactory;
    }

    // --------------------------------------------------
    // GET ALL USERS
    // --------------------------------------------------

    public async Task<IEnumerable<UserResponse>> GetAllAsync()
    {
        const string sql = """
            SELECT
                u.Id,
                u.Username,
                u.Email,
                u.RoleId,
                r.Name AS Role,
                u.IsActive,
                u.CreatedAt,
                u.UpdatedAt
            FROM Users u
            INNER JOIN Roles r
                ON u.RoleId = r.Id
            ORDER BY u.Username;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QueryAsync<UserResponse>(sql);
    }

    // --------------------------------------------------
    // GET USER BY ID
    // --------------------------------------------------

    public async Task<User?> GetByIdAsync(int id)
    {
        const string sql = """
            SELECT
                Id,
                Username,
                Email,
                PasswordHash,
                RoleId,
                IsActive,
                CreatedAt,
                UpdatedAt
            FROM Users
            WHERE Id = @Id;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<User>(
            sql,
            new { Id = id }
        );
    }

    // --------------------------------------------------
    // GET USER BY USERNAME
    // --------------------------------------------------

    public async Task<User?> GetByUsernameAsync(string username)
    {
        const string sql = """
            SELECT
                Id,
                Username,
                Email,
                PasswordHash,
                RoleId,
                IsActive,
                CreatedAt,
                UpdatedAt
            FROM Users
            WHERE Username = @Username;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<User>(
            sql,
            new { Username = username }
        );
    }

    // --------------------------------------------------
    // GET ROLE NAME
    // --------------------------------------------------

    public async Task<string?> GetRoleNameAsync(int roleId)
    {
        const string sql = """
            SELECT Name
            FROM Roles
            WHERE Id = @RoleId;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.QuerySingleOrDefaultAsync<string>(
            sql,
            new { RoleId = roleId }
        );
    }

    // --------------------------------------------------
    // CHECK ROLE EXISTS
    // --------------------------------------------------

    public async Task<bool> RoleExistsAsync(int roleId)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM Roles
            WHERE Id = @RoleId;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<bool>(
            sql,
            new { RoleId = roleId }
        );
    }

    // --------------------------------------------------
    // CHECK USERNAME EXISTS
    // --------------------------------------------------

    public async Task<bool> UsernameExistsAsync(string username)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM Users
            WHERE Username = @Username;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<bool>(
            sql,
            new { Username = username }
        );
    }

    // --------------------------------------------------
    // CHECK EMAIL EXISTS
    // --------------------------------------------------

    public async Task<bool> EmailExistsAsync(string email)
    {
        const string sql = """
            SELECT COUNT(1)
            FROM Users
            WHERE Email = @Email;
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<bool>(
            sql,
            new { Email = email }
        );
    }

    // --------------------------------------------------
    // CREATE USER
    // --------------------------------------------------

    public async Task<int> CreateAsync(
        string username,
        string email,
        string passwordHash,
        int roleId)
    {
        const string sql = """
            INSERT INTO Users
            (
                Username,
                Email,
                PasswordHash,
                RoleId,
                IsActive
            )
            VALUES
            (
                @Username,
                @Email,
                @PasswordHash,
                @RoleId,
                1
            );

            SELECT CAST(SCOPE_IDENTITY() AS INT);
            """;

        using var connection =
            _dbConnectionFactory.CreateConnection();

        return await connection.ExecuteScalarAsync<int>(
            sql,
            new
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                RoleId = roleId
            }
        );
    }

    // --------------------------------------------------
    // UPDATE USER ROLE
    // --------------------------------------------------

    public async Task<bool> UpdateRoleAsync(
        int id,
        int roleId)
    {
        const string sql = """
            UPDATE Users
            SET
                RoleId = @RoleId,
                UpdatedAt = SYSUTCDATETIME()
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
                    RoleId = roleId
                }
            );

        return rowsAffected > 0;
    }

    // --------------------------------------------------
    // ACTIVATE / DEACTIVATE USER
    // --------------------------------------------------

    public async Task<bool> UpdateActiveStatusAsync(
        int id,
        bool isActive)
    {
        const string sql = """
            UPDATE Users
            SET
                IsActive = @IsActive,
                UpdatedAt = SYSUTCDATETIME()
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
                    IsActive = isActive
                }
            );

        return rowsAffected > 0;
    }
}