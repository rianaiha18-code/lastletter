require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./db");

const app = express();
const PORT = 3000;

// JSON形式のデータを受け取れるようにする
app.use(express.json());

// publicフォルダ内のHTML・CSS・JS・画像を公開
app.use(express.static(path.join(__dirname, "public")));

// MySQL接続確認用API
app.get("/api/db-test", async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT DATABASE() AS databaseName, NOW() AS currentTime"
        );

        res.json({
            success: true,
            message: "MySQLへの接続に成功しました",
            database: rows[0].databaseName,
            currentTime: rows[0].currentTime
        });
    } catch (error) {
        console.error("MySQL接続エラー:", error);

        res.status(500).json({
            success: false,
            message: "MySQLへの接続に失敗しました"
        });
    }
});
// デモ用ユーザーID
const DEMO_USER_ID = 1;

// 全体メッセージを取得
app.get("/api/message", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `
            SELECT overall_message
            FROM users
            WHERE id = ?
            `,
            [DEMO_USER_ID]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "ユーザーが見つかりません"
            });
        }

        res.json({
            success: true,
            overallMessage: rows[0].overall_message || ""
        });
    } catch (error) {
        console.error("メッセージ取得エラー:", error);

        res.status(500).json({
            success: false,
            message: "メッセージの取得に失敗しました"
        });
    }
});

// 全体メッセージを保存
app.put("/api/message", async (req, res) => {
    try {
        const { overallMessage } = req.body;

        if (typeof overallMessage !== "string") {
            return res.status(400).json({
                success: false,
                message: "メッセージの形式が正しくありません"
            });
        }

        const [result] = await pool.execute(
            `
            UPDATE users
            SET overall_message = ?
            WHERE id = ?
            `,
            [overallMessage, DEMO_USER_ID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "ユーザーが見つかりません"
            });
        }

        res.json({
            success: true,
            message: "全体メッセージを更新しました"
        });
    } catch (error) {
        console.error("全体メッセージ更新エラー:", error);

        res.status(500).json({
            success: false,
            message: "全体メッセージの更新に失敗しました"
        });
    }
});
app.put("/api/recipients/:id", async (req, res) => {
    try {
        const recipientId = Number(req.params.id);
        const { name, relation, message } = req.body;

        if (!Number.isInteger(recipientId) || recipientId <= 0) {
            return res.status(400).json({
                success: false,
                message: "相手IDが正しくありません"
            });
        }

        if (!name || !relation) {
            return res.status(400).json({
                success: false,
                message: "名前と関係を入力してください"
            });
        }

        const [result] = await pool.execute(
            `
            UPDATE recipients
            SET
                name = ?,
                relation = ?,
                message = ?
            WHERE id = ?
              AND user_id = ?
            `,
            [
                name,
                relation,
                message || "",
                recipientId,
                DEMO_USER_ID
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "更新対象が見つかりません"
            });
        }

        res.json({
            success: true,
            message: "相手情報を更新しました"
        });
    } catch (error) {
        console.error("相手更新エラー:", error);

        res.status(500).json({
            success: false,
            message: "相手情報の更新に失敗しました"
        });
    }
});
app.get("/api/recipients", async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `
            SELECT
                id,
                name,
                relation,
                view_code AS code,
                message
            FROM recipients
            WHERE user_id = ?
            ORDER BY id ASC
            `,
            [DEMO_USER_ID]
        );

        res.json({
            success: true,
            recipients: rows
        });
    } catch (error) {
        console.error("相手一覧取得エラー:", error);

        res.status(500).json({
            success: false,
            message: "相手一覧の取得に失敗しました"
        });
    }
});

app.post("/api/recipients", async (req, res) => {
    try {
        const {
            name,
            relation,
            keyword,
            message,
            code
        } = req.body;

        if (!name || !relation || !keyword || !code) {
            return res.status(400).json({
                success: false,
                message: "必要な項目が不足しています"
            });
        }

        const [result] = await pool.execute(
            `
            INSERT INTO recipients (
                user_id,
                name,
                relation,
                view_code,
                keyword_hash,
                message
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                DEMO_USER_ID,
                name,
                relation,
                code,
                keyword,
                message || ""
            ]
        );

        res.status(201).json({
            success: true,
            id: result.insertId,
            message: "相手を登録しました"
        });
    } catch (error) {
        console.error("相手登録エラー:", error);

        res.status(500).json({
            success: false,
            message: "相手の登録に失敗しました"
        });
    }
});
app.post("/api/view-access", async (req, res) => {
    try {
        const { viewCode, keyword } = req.body;

        if (!viewCode || !keyword) {
            return res.status(400).json({
                success: false,
                message: "閲覧コードと合言葉を入力してください"
            });
        }

        const [rows] = await pool.execute(
            `
            SELECT
                recipients.id,
                recipients.name,
                recipients.relation,
                recipients.view_code AS code,
                recipients.message,
                recipients.keyword_hash,
                users.overall_message
            FROM recipients
            INNER JOIN users
                ON recipients.user_id = users.id
            WHERE recipients.view_code = ?
            LIMIT 1
            `,
            [viewCode]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "閲覧コードまたは合言葉が違います"
            });
        }

        const recipient = rows[0];

        // MVP版ではkeyword_hashに合言葉をそのまま保存しています
        if (recipient.keyword_hash !== keyword) {
            return res.status(401).json({
                success: false,
                message: "閲覧コードまたは合言葉が違います"
            });
        }

        res.json({
            success: true,
            recipient: {
                id: recipient.id,
                name: recipient.name,
                relation: recipient.relation,
                code: recipient.code,
                message: recipient.message || "",
                overallMessage: recipient.overall_message || ""
            }
        });
    } catch (error) {
        console.error("閲覧確認エラー:", error);

        res.status(500).json({
            success: false,
            message: "閲覧確認に失敗しました"
        });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});