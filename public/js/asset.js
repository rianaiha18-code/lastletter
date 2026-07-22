document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const saveButton =
            document.getElementById(
                "saveAssetButton"
            );

        const toast =
            document.getElementById("toast");

        const subscriptionList =
            document.getElementById(
                "subscriptionList"
            );

        const bankList =
            document.getElementById(
                "bankList"
            );

        const cardList =
            document.getElementById(
                "cardList"
            );

        const snsList =
            document.getElementById(
                "snsList"
            );

        const mobileCarrier =
            document.getElementById(
                "mobileCarrier"
            );

        const deviceName =
            document.getElementById(
                "deviceName"
            );

        const unlockHint =
            document.getElementById(
                "unlockHint"
            );


        // ==========================================
        // トースト表示
        // ==========================================
        function showToast(message) {
            if (!toast) {
                alert(message);
                return;
            }

            toast.textContent = message;
            toast.classList.add("show");

            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }


        // ==========================================
        // HTML文字列を安全に表示するための処理
        // ==========================================
        function escapeHtml(value = "") {
            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#039;");
        }


        // ==========================================
        // サブスク入力欄
        // ==========================================
        function createSubscriptionEntry(
            asset = {},
            removable = true
        ) {
            const wrapper =
                document.createElement("div");

            wrapper.className = "asset-entry";
            wrapper.dataset.category =
                "subscription";

            wrapper.innerHTML = `
                ${
                    removable
                        ? `
                        <button
                            type="button"
                            class="delete-entry"
                        >
                            削除
                        </button>
                        `
                        : ""
                }

                <label>サービス名</label>

                <input
                    type="text"
                    class="subscription-service"
                    placeholder="例）Netflix、Spotify"
                    value="${escapeHtml(
                        asset.title
                    )}"
                >

                <label>
                    登録メールアドレス
                </label>

                <input
                    type="email"
                    class="subscription-email"
                    placeholder="例）sample@example.com"
                    value="${escapeHtml(
                        asset.value1
                    )}"
                >

                <label>支払方法</label>

                <input
                    type="text"
                    class="subscription-payment"
                    placeholder="例）クレジットカード"
                    value="${escapeHtml(
                        asset.value2
                    )}"
                >

                <label>解約メモ</label>

                <textarea
                    class="subscription-memo"
                    placeholder="解約方法や注意点を書いてください。"
                >${escapeHtml(asset.memo)}</textarea>
            `;

            return wrapper;
        }


        // ==========================================
        // 銀行入力欄
        // ==========================================
        function createBankEntry(
            asset = {},
            removable = true
        ) {
            const wrapper =
                document.createElement("div");

            wrapper.className = "asset-entry";
            wrapper.dataset.category = "bank";

            wrapper.innerHTML = `
                ${
                    removable
                        ? `
                        <button
                            type="button"
                            class="delete-entry"
                        >
                            削除
                        </button>
                        `
                        : ""
                }

                <label>銀行名</label>

                <input
                    type="text"
                    class="bank-name"
                    placeholder="例）〇〇銀行"
                    value="${escapeHtml(
                        asset.title
                    )}"
                >

                <label>支店名</label>

                <input
                    type="text"
                    class="bank-branch"
                    placeholder="例）那覇支店"
                    value="${escapeHtml(
                        asset.value1
                    )}"
                >

                <label>口座種別</label>

                <select
                    class="bank-account-type"
                >
                    <option value="">
                        選択してください
                    </option>

                    <option
                        value="普通"
                        ${
                            asset.value2 === "普通"
                                ? "selected"
                                : ""
                        }
                    >
                        普通
                    </option>

                    <option
                        value="当座"
                        ${
                            asset.value2 === "当座"
                                ? "selected"
                                : ""
                        }
                    >
                        当座
                    </option>

                    <option
                        value="貯蓄"
                        ${
                            asset.value2 === "貯蓄"
                                ? "selected"
                                : ""
                        }
                    >
                        貯蓄
                    </option>
                </select>

                <label>用途メモ</label>

                <textarea
                    class="bank-memo"
                    placeholder="例）給与振込用、生活費用など"
                >${escapeHtml(asset.memo)}</textarea>

                <p class="help-text">
                    ※ 暗証番号やパスワードは保存しないでください。
                </p>
            `;

            return wrapper;
        }


        // ==========================================
        // クレジットカード入力欄
        // ==========================================
        function createCardEntry(
            asset = {},
            removable = true
        ) {
            const wrapper =
                document.createElement("div");

            wrapper.className = "asset-entry";
            wrapper.dataset.category =
                "credit-card";

            wrapper.innerHTML = `
                ${
                    removable
                        ? `
                        <button
                            type="button"
                            class="delete-entry"
                        >
                            削除
                        </button>
                        `
                        : ""
                }

                <label>カード会社</label>

                <input
                    type="text"
                    class="card-company"
                    placeholder="例）楽天カード、三井住友カード"
                    value="${escapeHtml(
                        asset.title
                    )}"
                >

                <label>
                    引き落とし口座
                </label>

                <input
                    type="text"
                    class="card-bank-account"
                    placeholder="例）〇〇銀行"
                    value="${escapeHtml(
                        asset.value1
                    )}"
                >

                <label>利用中サービス</label>

                <textarea
                    class="card-services"
                    placeholder="このカードで支払っているサービスを書いてください。"
                >${escapeHtml(asset.memo)}</textarea>
            `;

            return wrapper;
        }


        // ==========================================
        // SNS入力欄
        // ==========================================
        function createSnsEntry(
            asset = {},
            removable = true
        ) {
            const wrapper =
                document.createElement("div");

            wrapper.className = "asset-entry";
            wrapper.dataset.category = "sns";

            const services = [
                "Instagram",
                "X",
                "TikTok",
                "Facebook",
                "Google",
                "Apple ID",
                "その他"
            ];

            const requests = [
                "削除してほしい",
                "残してほしい",
                "家族に任せる"
            ];

            const serviceOptions =
                services
                    .map(service => {
                        const selected =
                            asset.title === service
                                ? "selected"
                                : "";

                        return `
                            <option
                                value="${service}"
                                ${selected}
                            >
                                ${service}
                            </option>
                        `;
                    })
                    .join("");

            const requestOptions =
                requests
                    .map(request => {
                        const selected =
                            asset.value2 === request
                                ? "selected"
                                : "";

                        return `
                            <option
                                value="${request}"
                                ${selected}
                            >
                                ${request}
                            </option>
                        `;
                    })
                    .join("");

            wrapper.innerHTML = `
                ${
                    removable
                        ? `
                        <button
                            type="button"
                            class="delete-entry"
                        >
                            削除
                        </button>
                        `
                        : ""
                }

                <label>サービス名</label>

                <select class="sns-service">
                    <option value="">
                        選択してください
                    </option>

                    ${serviceOptions}
                </select>

                <label>アカウント名</label>

                <input
                    type="text"
                    class="sns-account-name"
                    placeholder="例）@username"
                    value="${escapeHtml(
                        asset.value1
                    )}"
                >

                <label>希望</label>

                <select class="sns-request">
                    <option value="">
                        選択してください
                    </option>

                    ${requestOptions}
                </select>

                <label>メモ</label>

                <textarea
                    class="sns-memo"
                    placeholder="伝えておきたいことを書いてください。"
                >${escapeHtml(asset.memo)}</textarea>
            `;

            return wrapper;
        }


        // ==========================================
        // 各入力欄を最低1件表示
        // ==========================================
        function showEmptyEntries() {
            subscriptionList.innerHTML = "";
            bankList.innerHTML = "";
            cardList.innerHTML = "";
            snsList.innerHTML = "";

            subscriptionList.appendChild(
                createSubscriptionEntry(
                    {},
                    false
                )
            );

            bankList.appendChild(
                createBankEntry({}, false)
            );

            cardList.appendChild(
                createCardEntry({}, false)
            );

            snsList.appendChild(
                createSnsEntry({}, false)
            );
        }


        // ==========================================
        // ＋追加ボタン
        // ==========================================
        document
            .getElementById(
                "addSubscriptionButton"
            )
            ?.addEventListener(
                "click",
                () => {
                    subscriptionList.appendChild(
                        createSubscriptionEntry()
                    );
                }
            );

        document
            .getElementById("addBankButton")
            ?.addEventListener(
                "click",
                () => {
                    bankList.appendChild(
                        createBankEntry()
                    );
                }
            );

        document
            .getElementById("addCardButton")
            ?.addEventListener(
                "click",
                () => {
                    cardList.appendChild(
                        createCardEntry()
                    );
                }
            );

        document
            .getElementById("addSnsButton")
            ?.addEventListener(
                "click",
                () => {
                    snsList.appendChild(
                        createSnsEntry()
                    );
                }
            );


        // ==========================================
        // 追加した入力欄を削除
        // ==========================================
        document.addEventListener(
            "click",
            event => {
                const deleteButton =
                    event.target.closest(
                        ".delete-entry"
                    );

                if (!deleteButton) {
                    return;
                }

                const entry =
                    deleteButton.closest(
                        ".asset-entry"
                    );

                if (!entry) {
                    return;
                }

                if (
                    !confirm(
                        "この項目を削除しますか？"
                    )
                ) {
                    return;
                }

                entry.remove();

                showToast(
                    "項目を削除しました。保存すると反映されます。"
                );
            }
        );


        // ==========================================
        // 空のデータを保存対象から除外
        // ==========================================
        function hasAnyValue(asset) {
            return [
                asset.title,
                asset.value1,
                asset.value2,
                asset.value3,
                asset.memo
            ].some(value => {
                return (
                    typeof value === "string" &&
                    value.trim() !== ""
                );
            });
        }


        // ==========================================
        // 画面の入力内容を配列にする
        // ==========================================
        function collectAssets() {
            const assets = [];

            document
                .querySelectorAll(
                    "#subscriptionList .asset-entry"
                )
                .forEach(entry => {
                    const asset = {
                        category:
                            "subscription",

                        title:
                            entry
                                .querySelector(
                                    ".subscription-service"
                                )
                                ?.value.trim() ||
                            "",

                        value1:
                            entry
                                .querySelector(
                                    ".subscription-email"
                                )
                                ?.value.trim() ||
                            "",

                        value2:
                            entry
                                .querySelector(
                                    ".subscription-payment"
                                )
                                ?.value.trim() ||
                            "",

                        value3: "",

                        memo:
                            entry
                                .querySelector(
                                    ".subscription-memo"
                                )
                                ?.value.trim() ||
                            ""
                    };

                    if (hasAnyValue(asset)) {
                        assets.push(asset);
                    }
                });


            document
                .querySelectorAll(
                    "#bankList .asset-entry"
                )
                .forEach(entry => {
                    const asset = {
                        category: "bank",

                        title:
                            entry
                                .querySelector(
                                    ".bank-name"
                                )
                                ?.value.trim() ||
                            "",

                        value1:
                            entry
                                .querySelector(
                                    ".bank-branch"
                                )
                                ?.value.trim() ||
                            "",

                        value2:
                            entry
                                .querySelector(
                                    ".bank-account-type"
                                )
                                ?.value ||
                            "",

                        value3: "",

                        memo:
                            entry
                                .querySelector(
                                    ".bank-memo"
                                )
                                ?.value.trim() ||
                            ""
                    };

                    if (hasAnyValue(asset)) {
                        assets.push(asset);
                    }
                });


            document
                .querySelectorAll(
                    "#cardList .asset-entry"
                )
                .forEach(entry => {
                    const asset = {
                        category:
                            "credit-card",

                        title:
                            entry
                                .querySelector(
                                    ".card-company"
                                )
                                ?.value.trim() ||
                            "",

                        value1:
                            entry
                                .querySelector(
                                    ".card-bank-account"
                                )
                                ?.value.trim() ||
                            "",

                        value2: "",
                        value3: "",

                        memo:
                            entry
                                .querySelector(
                                    ".card-services"
                                )
                                ?.value.trim() ||
                            ""
                    };

                    if (hasAnyValue(asset)) {
                        assets.push(asset);
                    }
                });


            document
                .querySelectorAll(
                    "#snsList .asset-entry"
                )
                .forEach(entry => {
                    const asset = {
                        category: "sns",

                        title:
                            entry
                                .querySelector(
                                    ".sns-service"
                                )
                                ?.value ||
                            "",

                        value1:
                            entry
                                .querySelector(
                                    ".sns-account-name"
                                )
                                ?.value.trim() ||
                            "",

                        value2:
                            entry
                                .querySelector(
                                    ".sns-request"
                                )
                                ?.value ||
                            "",

                        value3: "",

                        memo:
                            entry
                                .querySelector(
                                    ".sns-memo"
                                )
                                ?.value.trim() ||
                            ""
                    };

                    if (hasAnyValue(asset)) {
                        assets.push(asset);
                    }
                });


            const deviceAsset = {
                category: "device",

                title:
                    deviceName?.value.trim() ||
                    "",

                value1:
                    mobileCarrier?.value.trim() ||
                    "",

                value2:
                    unlockHint?.value.trim() ||
                    "",

                value3: "",
                memo: ""
            };

            if (hasAnyValue(deviceAsset)) {
                assets.push(deviceAsset);
            }

            return assets;
        }


        // ==========================================
        // 保存済みデータを画面に表示
        // ==========================================
        function renderAssets(assets) {
            subscriptionList.innerHTML = "";
            bankList.innerHTML = "";
            cardList.innerHTML = "";
            snsList.innerHTML = "";

            const subscriptions =
                assets.filter(
                    asset =>
                        asset.category ===
                        "subscription"
                );

            const banks =
                assets.filter(
                    asset =>
                        asset.category ===
                        "bank"
                );

            const cards =
                assets.filter(
                    asset =>
                        asset.category ===
                        "credit-card"
                );

            const snsAccounts =
                assets.filter(
                    asset =>
                        asset.category ===
                        "sns"
                );

            const device =
                assets.find(
                    asset =>
                        asset.category ===
                        "device"
                );


            if (subscriptions.length > 0) {
                subscriptions.forEach(
                    (asset, index) => {
                        subscriptionList
                            .appendChild(
                                createSubscriptionEntry(
                                    asset,
                                    index !== 0
                                )
                            );
                    }
                );
            } else {
                subscriptionList.appendChild(
                    createSubscriptionEntry(
                        {},
                        false
                    )
                );
            }


            if (banks.length > 0) {
                banks.forEach(
                    (asset, index) => {
                        bankList.appendChild(
                            createBankEntry(
                                asset,
                                index !== 0
                            )
                        );
                    }
                );
            } else {
                bankList.appendChild(
                    createBankEntry(
                        {},
                        false
                    )
                );
            }


            if (cards.length > 0) {
                cards.forEach(
                    (asset, index) => {
                        cardList.appendChild(
                            createCardEntry(
                                asset,
                                index !== 0
                            )
                        );
                    }
                );
            } else {
                cardList.appendChild(
                    createCardEntry(
                        {},
                        false
                    )
                );
            }


            if (snsAccounts.length > 0) {
                snsAccounts.forEach(
                    (asset, index) => {
                        snsList.appendChild(
                            createSnsEntry(
                                asset,
                                index !== 0
                            )
                        );
                    }
                );
            } else {
                snsList.appendChild(
                    createSnsEntry(
                        {},
                        false
                    )
                );
            }


            if (device) {
                deviceName.value =
                    device.title || "";

                mobileCarrier.value =
                    device.value1 || "";

                unlockHint.value =
                    device.value2 || "";
            } else {
                deviceName.value = "";
                mobileCarrier.value = "";
                unlockHint.value = "";
            }
        }


        // ==========================================
        // DBから読み込む
        // ==========================================
        async function loadAssets() {
            try {
                const response =
                    await fetch(
                        "/api/assets"
                    );

                const data =
                    await response.json();

                if (response.status === 401) {
                    window.location.href =
                        "/login.html";

                    return;
                }

                if (
                    !response.ok ||
                    !data.success
                ) {
                    throw new Error(
                        data.message ||
                        "読み込みに失敗しました"
                    );
                }

                renderAssets(
                    data.assets || []
                );

            } catch (error) {
                console.error(
                    "デジタル資産読み込みエラー:",
                    error
                );

                showEmptyEntries();

                showToast(
                    error.message ||
                    "情報を読み込めませんでした"
                );
            }
        }


        // ==========================================
        // DBへ保存
        // ==========================================
        saveButton?.addEventListener(
            "click",
            async () => {
                const originalText =
                    saveButton.textContent;

                saveButton.disabled = true;
                saveButton.textContent = "保存中...";

                try {
                    const assets = collectAssets();

                    const response =
                        await fetch("/api/assets", {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                assets
                            })
                        });

                    const data =
                        await response.json();

                    if (response.status === 401) {
                        window.location.href =
                            "/正しいログイン画面のパス";
                        return;
                    }

                    if (
                        !response.ok ||
                        !data.success
                    ) {
                        throw new Error(
                            data.message ||
                            "保存に失敗しました"
                        );
                    }

                    showToast(
                        "✔ デジタル資産情報を保存しました"
                    );

                    try {
                        await loadAssets();
                    } catch (loadError) {
                        console.error(
                            "保存後の再読み込みエラー:",
                            loadError
                        );
                    }

                } catch (error) {
                    console.error(
                        "デジタル資産保存エラー:",
                        error
                    );

                    showToast(
                        error.message ||
                        "保存に失敗しました"
                    );

                } finally {
                    saveButton.disabled = false;
                    saveButton.textContent =
                        originalText;
                }
            }
        );


        // 最初に保存済み情報を読み込む
        await loadAssets();
    }
);