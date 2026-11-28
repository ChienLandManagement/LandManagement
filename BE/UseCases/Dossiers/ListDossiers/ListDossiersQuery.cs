using LandManagement.Common.Interfaces;
using LandManagement.Entities;
using ResultLib.Models;

namespace LandManagement.UseCases.Dossiers.ListDossiers;

/// <summary>Overdue: chỉ hồ sơ chưa xong và đã quá hạn. ReceivedFrom/ReceivedTo: khoảng ngày tiếp nhận.</summary>
public record ListDossiersQuery(Guid? WardId, DossierStatus? Status, bool? Overdue, DateOnly? ReceivedFrom, DateOnly? ReceivedTo, int CurrentPage = 1,
    int PageSize = 20, string? SortBy = null, bool IsDescending = false, string? Query = null)
    : PaginationRequest(CurrentPage, PageSize, SortBy, IsDescending, Query), IQuery<PagedResponse<DossierItem>>;

public class ListDossiersValidator : PaginationRequestValidator<ListDossiersQuery>;
