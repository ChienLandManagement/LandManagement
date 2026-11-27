using QRCoder;

namespace LandManagement.Common;

public static class QrCodeHelper
{
    public static byte[] GeneratePngBytes(string content, int pixelsPerModule = 10)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(content, QRCodeGenerator.ECCLevel.Q);
        return new PngByteQRCode(data).GetGraphic(pixelsPerModule);
    }
}
