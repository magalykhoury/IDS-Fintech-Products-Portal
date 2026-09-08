using IdsFintechPortal.Api.DTOs;
using EnvironmentModel = IdsFintechPortal.Api.Models.Environment;

namespace IdsFintechPortal.Api.Repositories;

public interface IEnvironmentRepository
{
    Task<IEnumerable<EnvironmentModel>> GetAllAsync();

    Task<EnvironmentModel?> GetByIdAsync(int id);

    Task<int> CreateAsync(CreateEnvironmentRequest request);

    Task<bool> UpdateAsync(int id, UpdateEnvironmentRequest request);

    Task<bool> DeleteAsync(int id);
}