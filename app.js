require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcrypt");
const session = require("express-session");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

const app = express();
const PORT = process.env.PORT || 3000;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error(
                    "JPEG、PNG、WebP形式の画像を選択してください"
                )
            );
        }

        callback(null, true);
    }
});
function uploadImageToCloudinary(fileBuffer, userId) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "lastletter/funeral-photos",
                public_id: `user-${userId}-${Date.now()}`,
                resource_type: "image"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });
}

// JSON形式のデータを受け取れるようにする
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 2
        }
    })
);
app.get("/", (req, res) => {
    if (req.session.demoAccess) {
        return res.redirect("/auth/index.html");
    }

    return res.redirect("/demo.html");
});

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


// 全体メッセージを取得
app.get("/api/message", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "ログインしてください"
            });
        }

        const [rows] = await pool.execute(
            `
            SELECT overall_message
            FROM users
            WHERE id = ?
            `,
            [userId]
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
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "ログインしてください"
            });
        }

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
            [overallMessage, userId]
        );

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
                userId
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
app.post("/api/recipients", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "ログインしてください"
            });
        }

        const { name, relation, keyword, message, code } = req.body;

        if (!name || !relation || !keyword || !code) {
            return res.status(400).json({
                success: false,
                message: "必要な項目を入力してください"
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
                userId,
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
app.get("/api/funeral-request", async (req, res) => {
    try {
        const userId = req.session.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "ログインしてください"
                });
            }
        const [rows] = await pool.execute(
            `
            SELECT
                ceremony_type AS ceremonyType,
                scale AS funeralScale,
                photo AS funeralPhoto,
                items_with_coffin AS coffinItems,
                bgm_song AS bgmSong,
                bgm_artist AS bgmArtist,
                bgm_reason AS bgmReason,
                ashes_destination AS ashesDestination,
                keep_items AS keepItems,
                discard_items AS discardItems,
                family_message AS familyMessage
            FROM funeral_requests
            WHERE user_id = ?
            `,
            [userId]
        );

        res.json({
            success: true,
            funeralRequest: rows[0] || null
        });
    } catch (error) {
        console.error("葬儀リクエスト取得エラー:", error);

        res.status(500).json({
            success: false,
            message: "葬儀リクエストの取得に失敗しました"
        });
    }
});
app.put("/api/funeral-request", async (req, res) => {
    try {
        const userId = req.session.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "ログインしてください"
                });
            }
        const {
            ceremonyType,
            funeralScale,
            funeralPhoto,
            coffinItems,
            bgmSong,
            bgmArtist,
            bgmReason,
            ashesDestination,
            keepItems,
            discardItems,
            familyMessage
        } = req.body;

        await pool.execute(
            `
            INSERT INTO funeral_requests (
                user_id,
                ceremony_type,
                scale,
                photo,
                items_with_coffin,
                bgm_song,
                bgm_artist,
                bgm_reason,
                ashes_destination,
                keep_items,
                discard_items,
                family_message
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

            ON DUPLICATE KEY UPDATE
                ceremony_type = VALUES(ceremony_type),
                scale = VALUES(scale),
                photo = VALUES(photo),
                items_with_coffin = VALUES(items_with_coffin),
                bgm_song = VALUES(bgm_song),
                bgm_artist = VALUES(bgm_artist),
                bgm_reason = VALUES(bgm_reason),
                ashes_destination = VALUES(ashes_destination),
                keep_items = VALUES(keep_items),
                discard_items = VALUES(discard_items),
                family_message = VALUES(family_message)
            `,
            [
                userId,
                ceremonyType || null,
                funeralScale || null,
                funeralPhoto || null,
                coffinItems || null,
                bgmSong || null,
                bgmArtist || null,
                bgmReason || null,
                ashesDestination || null,
                keepItems || null,
                discardItems || null,
                familyMessage || null
            ]
        );

        res.json({
            success: true,
            message: "葬儀リクエストを保存しました"
        });
    } catch (error) {
        console.error("葬儀リクエスト保存エラー:", error);

        res.status(500).json({
            success: false,
            message: "葬儀リクエストの保存に失敗しました"
        });
    }
});
app.post(
    "/api/funeral-photo",
    requireLogin,
    upload.single("photo"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "画像ファイルを選択してください"
                });
            }

            const userId = req.session.userId;

            const result = await uploadImageToCloudinary(
                req.file.buffer,
                userId
            );

            return res.json({
                success: true,
                photoUrl: result.secure_url
            });

        } catch (error) {
            console.error("葬儀写真アップロードエラー:", error);

            return res.status(500).json({
                success: false,
                message: "画像のアップロードに失敗しました"
            });
        }
    }
);
app.delete("/api/recipients/:id", async (req, res) => {
    try {
        const recipientId = Number(req.params.id);

        const [result] = await pool.execute(
            `
            DELETE FROM recipients
            WHERE id = ?
              AND user_id = ?
            `,
            [
                recipientId,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "削除する相手が見つかりません"
            });
        }

        res.json({
            success: true,
            message: "削除しました"
        });

    } catch (error) {

        console.error("削除エラー:", error);

        res.status(500).json({
            success: false,
            message: "削除に失敗しました"
        });

    }
});
app.post("/api/register", async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            confirmPassword
        } = req.body;

        const trimmedUsername =
            typeof username === "string" ? username.trim() : "";

        const normalizedEmail =
            typeof email === "string"
                ? email.trim().toLowerCase()
                : "";

        if (
            !trimmedUsername ||
            !normalizedEmail ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message: "すべての項目を入力してください"
            });
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "有効なメールアドレスを入力してください"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "確認用パスワードが一致しません"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "パスワードは8文字以上にしてください"
            });
        }

        const [existingUsers] = await pool.execute(
            `
            SELECT id
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                success: false,
                message: "このメールアドレスはすでに登録されています"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const [result] = await pool.execute(
            `
            INSERT INTO users (
                username,
                email,
                password_hash,
                overall_message
            )
            VALUES (?, ?, ?, '')
            `,
            [
                trimmedUsername,
                normalizedEmail,
                passwordHash
            ]
        );

        req.session.userId = result.insertId;
        req.session.username = trimmedUsername;

        res.status(201).json({
            success: true,
            message: "新規登録が完了しました",
            user: {
                id: result.insertId,
                username: trimmedUsername,
                email: normalizedEmail
            }
        });
    } catch (error) {
        console.error("新規登録エラー:", error);

        res.status(500).json({
            success: false,
            message: "新規登録に失敗しました"
        });
    }
});
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail =
            typeof email === "string"
                ? email.trim().toLowerCase()
                : "";

        if (!normalizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: "メールアドレスとパスワードを入力してください"
            });
        }

        const [rows] = await pool.execute(
            `
            SELECT
                id,
                username,
                email,
                password_hash
            FROM users
            WHERE email = ?
            LIMIT 1
            `,
            [normalizedEmail]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "メールアドレスまたはパスワードが違います"
            });
        }

        const user = rows[0];

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "メールアドレスまたはパスワードが違います"
            });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        res.json({
            success: true,
            message: "ログインしました",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("ログインエラー:", error);

        res.status(500).json({
            success: false,
            message: "ログインに失敗しました"
        });
    }
});
app.get("/api/me", (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "ログインしていません"
        });
    }

    res.json({
        success: true,
        userId: req.session.userId,
        username: req.session.username
    });
});
app.get("/api/recipients", async (req, res) => {
    try {
        const userId = req.session.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "ログインしてください"
            });
        }

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
            [userId]
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
app.post("/api/logout", (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error("ログアウトエラー:", error);

            return res.status(500).json({
                success: false,
                message: "ログアウトに失敗しました"
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            success: true,
            message: "ログアウトしました"
        });
    });
});
app.post("/api/demo-access", (req, res) => {
    const { accessCode } = req.body;

    if (!accessCode) {
        return res.status(400).json({
            success: false,
            message: "アクセスコードを入力してください"
        });
    }

    if (accessCode !== process.env.DEMO_ACCESS_CODE) {
        return res.status(401).json({
            success: false,
            message: "アクセスコードが違います"
        });
    }

    req.session.demoAccess = true;

    req.session.save((error) => {
        if (error) {
            console.error("デモ認証保存エラー:", error);

            return res.status(500).json({
                success: false,
                message: "アクセス認証に失敗しました"
            });
        }

        res.json({
            success: true,
            message: "アクセスを許可しました"
        });
    });
});
function requireDemoAccess(req, res, next) {
    if (!req.session.demoAccess) {
        return res.status(403).json({
            success: false,
            message: "デモアクセス認証が必要です"
        });
    }

    next();
}
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            success: false,
            message: "ログインしてください"
        });
    }

    next();
}
app.post(
    "/api/funeral-photo",
    requireLogin,
    upload.single("photo"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "画像ファイルを選択してください"
                });
            }

            const result = await uploadImageToCloudinary(
                req.file.buffer,
                req.session.userId
            );

            res.json({
                success: true,
                photoUrl: result.secure_url
            });

        } catch (error) {
            console.error("葬儀写真アップロードエラー:", error);

            res.status(500).json({
                success: false,
                message: "画像のアップロードに失敗しました"
            });
        }
    }
);
app.get("/api/demo-access", (req, res) => {
    if (!req.session.demoAccess) {
        return res.status(403).json({
            success: false,
            message: "デモアクセス認証が必要です"
        });
    }

    res.json({
        success: true
    });
});
app.post("/api/demo-logout", (req, res) => {
    req.session.demoAccess = false;

    req.session.save((error) => {
        if (error) {
            return res.status(500).json({
                success: false
            });
        }

        res.json({
            success: true
        });
    });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});