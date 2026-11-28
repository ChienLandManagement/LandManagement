using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandTypes.UpdateLandType;

public record UpdateLandTypeCommand(Guid Id, string Code, string Name, Guid? ParentId, int SortOrder, bool InB02, bool InB05) : ICommand<LandTypeItem>;
