using LandManagement.Common.Interfaces;
using LandManagement.Entities;

namespace LandManagement.UseCases.LandTypes.CreateLandType;

public record CreateLandTypeCommand(string Code, string Name, Guid? ParentId, bool InB02, bool InB05) : ICommand<LandTypeItem>;
