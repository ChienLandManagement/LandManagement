using LandManagement.Common.Interfaces;

namespace LandManagement.UseCases.LandChanges.CreateLandChange;

// FromLandTypeId = null: tăng khác; ToLandTypeId = null: giảm khác.
public record CreateLandChangeCommand(Guid PeriodId, DateOnly ChangeDate, Guid? FromLandTypeId, Guid? ToLandTypeId, decimal Area, Guid? HolderTypeId, string? Note)
    : ICommand<LandChangeItem>;
