using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandChanges.UpdateLandChange;

public record UpdateLandChangeCommand(Guid Id, DateOnly ChangeDate, Guid? FromLandTypeId, Guid? ToLandTypeId, decimal Area, Guid? HolderTypeId, string? Note, LandChangeReason? Reason = null, string? ReasonText = null)
    : ICommand<LandChangeItem>;
