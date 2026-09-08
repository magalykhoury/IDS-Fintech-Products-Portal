using IdsFintechPortal.Api.DTOs;

namespace IdsFintechPortal.Api.Repositories;

public interface IServerRepository
{
    Task<IEnumerable<ServerResponse>> GetAllAsync();

    Task<ServerResponse?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateServerRequest request);

    Task<bool> UpdateAsync(int id, UpdateServerRequest request);

    Task<bool> DeleteAsync(int id);
}