using IdsFintechPortal.Api.DTOs;
using IdsFintechPortal.Api.Models;

namespace IdsFintechPortal.Api.Repositories;

public interface ITechnologyRepository
{
    Task<IEnumerable<Technology>> GetAllAsync();

    Task<Technology?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateTechnologyRequest request);

    Task<bool> UpdateAsync(int id, UpdateTechnologyRequest request);

    Task<bool> DeleteAsync(int id);
}