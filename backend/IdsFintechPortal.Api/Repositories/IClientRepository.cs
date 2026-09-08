using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface IClientRepository
{
    Task<IEnumerable<Client>> GetAllAsync();

    Task<Client?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateClientRequest request);

    Task<bool> UpdateAsync(int id, UpdateClientRequest request);

    Task<bool> DeleteAsync(int id);
}