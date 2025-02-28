# enwords-pdf

**© 2024 TwoSquirrels**  
ライセンス: [MIT License](LICENSE)

シンプルな英単語テストの PDF を生成するツールです。Web と CLI から利用できます。単語帳の英単語リストは、[受かる英語](https://ukaru-eigo.com/) 様のデータを使用しています。

> [!IMPORTANT]
> このツールを利用するには、Node.js と pnpm が必要です。

## Web での利用方法

クローンしたこのリポジトリのディレクトリ内で `pnpm start` を実行すると、<http://localhost:3000> にサイトが立ち上がります。
このサイトをホスティングしてアクセスし、UI に従って操作してください。

## CLI での利用方法

### インストール

クローンしたこのリポジトリのディレクトリ内で、以下のコマンドを実行してください。

```bash
pnpm pack
npm install -g enwords-pdf-*.tgz
```

### 使い方

```bash
enwords-pdf [単語帳 ID] [出力ファイル名] [範囲の始まり] [範囲の終わり] [問題数] [シード値]
```

例: `enwords-pdf systan exam.pdf 501 600 30 1234`

### 単語帳 ID 一覧

|              単語帳名              | 単語帳 ID        |
| :--------------------------------: | :--------------- |
|           有名単語帳融合           | `complete`       |
|          必携英単語 LEAP           | `leap`           |
|  英検準１級 でる順パス単 (５訂版)  | `passtan`        |
|      システム英単語 (５訂版)       | `systan`         |
|            単語王 2202             | `tango_ou`       |
|   英検準１級 単熟語 EX (第２版)    | `tanjukugoex`    |
|   英単語ターゲット 1400 (５訂版)   | `target1400`     |
| 英単語ターゲット not 1900 but 1400 | `target1400only` |
|   英単語ターゲット 1900 (６訂版)   | `target1900`     |
|   英単語ターゲット 1900 (５訂版)   | `target1900_5`   |
|           鉄壁 (改訂版)            | `teppeki`        |
