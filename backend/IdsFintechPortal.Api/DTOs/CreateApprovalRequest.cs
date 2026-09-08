using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class CreateApprovalRequest
{
    [Required]
    [MaxLength(50)]
    public string EntityType { get; set; } = string.Empty;

    [Required]
    public int EntityId { get; set; }

    [MaxLength(1000)]
    public string? Description { get; set; }
}
