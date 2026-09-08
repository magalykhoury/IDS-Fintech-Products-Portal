using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IUserRepository
{
    Task<IEnumerable<UserResponse>> GetAllAsync();

    Task<User?> GetByIdAsync(int id);

    Task<User?> GetByUsernameAsync(string username);

    Task<string?> GetRoleNameAsync(int roleId);

    Task<bool> RoleExistsAsync(int roleId);

    Task<bool> UsernameExistsAsync(string username);

    Task<bool> EmailExistsAsync(string email);

    Task<int> CreateAsync(
        string username,
        string email,
        string passwordHash,
        int roleId);

    Task<bool> UpdateRoleAsync(
        int id,
        int roleId);

    Task<bool> UpdateActiveStatusAsync(
        int id,
        bool isActive);
}