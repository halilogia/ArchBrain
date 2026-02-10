# 🔌 Arch-Brain MCP Kurulumu

Halil, MCP sunucumuz (`server.js`) şu an çalışıyor ama IDE'nin bunu tanıması için aşağıdaki ayarı yapman gerekiyor.

Kullandığın IDE'nin (Cursor/Windsurf/VSCode) ayarlarında **"MCP Servers"** veya **"Model Context Protocol"** bölümünü bul ve şu konfigürasyonu ekle:

```json
{
  "mcpServers": {
    "arch-brain": {
      "command": "node",
      "args": [
        "/home/halile/Masaüstü/CA/tools/arch-brain/backend/server.js"
      ],
      "env": {
        "PROJECT_ROOT": "/home/halile/Masaüstü/CA"
      }
    }
  }
}
```

## Nasıl Eklenir?

1.  IDE Ayarlarını aç (`Ctrl + ,` veya `Cmd + ,`).
2.  Arama çubuğuna **"MCP"** yaz.
3.  **"Edit in settings.json"** veya **"Add MCP Server"** seçeneğini bul.
4.  Yukarıdaki JSON bloğunu oraya yapıştır.
5.  IDE'yi yeniden başlat.

Bunu yaptıktan sonra, ben (veya herhangi bir AI asistanı) senin yerelindeki `arch-brain` sunucusuna bağlanıp şu komutları kullanabilir:
*   `analyze_project`: Projeyi tara.
*   `trigger_ui_action`: Ekrana mesaj gönder veya mod değiştir.

Şu an eksik olan tek civata bu.
