using System.ComponentModel.DataAnnotations;

namespace IdsFintechPortal.Api.DTOs;

public class ReviewApprovalRequest
{
    [Required]
    [RegularExpression("^(Approved|Rejected)$")]
    public string Status { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Comment { get; set; }
}
