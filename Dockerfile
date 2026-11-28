FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY BE/LandManagement.csproj BE/
RUN dotnet restore BE/LandManagement.csproj
COPY BE/ BE/
RUN dotnet publish BE/LandManagement.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/publish .
# Heroku cấp cổng qua $PORT
CMD ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-8080} dotnet LandManagement.dll"]
