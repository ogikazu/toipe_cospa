document.addEventListener("DOMContentLoaded", () => {
    // 
    class ToipeCospa {
        constructor() {
            // 新規追加項目を強調表示するための状態変数
            this.newAddition = false;
            // ランキングを表示させるDOM要素
            this.rankingSelector = "#ranking";
            // 使用するlocal storageの名前
            this.storageName = "toipes";
            // toipes配列を初期化し、ランキングを生成する。
            this.toipesInit();
            this.makeRanking();
            // 各ボタン要素を取得
            this.sendBtn = document.querySelector(".send-button");
            this.clearBtn = document.querySelector(".clear-button");
            // 各ボタンのリスナーにハンドラを登録
            this.sendBtn.addEventListener("click", () => this.sendHandler());
            this.clearBtn.addEventListener("click", () => this.clearHandler());
        }

        toipesInit() {
            // toipeの配列を初期化
            this.toipes = [];
            // localStorageに対応するデータがあれば受け取って配列に追加
            if (localStorage[this.storageName]) {
                this.toipes = JSON.parse(localStorage[this.storageName]);
            }
        }

        makeRanking() {
            // toipes配列を元にランキングを生成、表示させるメソッド
            // toipes配列が空であれば案内コメントを生成、空でなければランキングを生成する
            if (this.toipes.length === 0) {
                // toipes配列が空であれば、案内コメントを生成し、ランキング要素の子要素をそのpタグで置き換える
                let p = document.createElement("p");
                p.append("ここに計算結果が表示されます...");    
                document.querySelector(this.rankingSelector).replaceChildren(p);
            } else {
                // toipesに要素があれば、ランキングを生成
                let liArray = [];
                let lastCospa = null;
                let rank = 1; //順位
                // 新規追加状態の場合、一番最近のtoipeオブジェクトのインデックス番号を取得する
                let newIndex = null;
                if (this.newAddition) {
                    // toipes配列から登録日の配列を作り、最新のデータを探す
                    let dateArray = this.toipes.map(toipe => Date.parse(toipe.date));
                    newIndex = dateArray.indexOf(Math.max(...dateArray));
                }
                // データごとにliタグを作り順位等を入力、対応する削除ボタンを追加してliArrayに追加
                // lastCospaで直前の値と比較し、コスパが同じものがあったら同立順位とする。
                for(let toipe of this.toipes) {
                    // toipeのインデックス番号を取得
                    let index = this.toipes.indexOf(toipe);
                    // liの中のにrankDiv、centerDiv、oneClearBtnを作り
                    // centerDivの中にhedderDivとdetailDivをいれる
                    // データごとに関連づけるために、liのclassとbtnのidにインデックス番号を登録
                    let li = document.createElement("li");
                        li.className = `index${index}`;
                        // 最新のインデックス番号だった場合、CSSで強調するため_newクラスを追加。状態変数をfalseに
                        if (index === newIndex) {
                            li.classList.add("_new");
                            this.newAddition = false;
                        }
                    let rankDiv = document.createElement("div");
                        rankDiv.className = "rank";
                    let centerDiv = document.createElement("div");
                        centerDiv.className = "center";
                    let hedderDiv = document.createElement("div");
                        hedderDiv.className = "hedder";
                    let detailDiv = document.createElement("div");
                        detailDiv.className = "detail";
                    let oneClearBtn = document.createElement("button");
                        oneClearBtn.textContent = "✕";
                        oneClearBtn.type = "button";
                        oneClearBtn.className = "one-clear-btn";
                        oneClearBtn.id = `index${index}`;
                    // lastCospaがnullでなくかつそれよりcospaが大きければrankをインクリメント
                    if (lastCospa && lastCospa < toipe.cospa) rank++;
                    // li要素に概要のテキストと削除ボタンを追加し、liArrayに追加
                    rankDiv.append(`No.${rank}`);
                    hedderDiv.append(`${toipe.cospa}円/m ${toipe.name}`);
                    detailDiv.append(`${toipe.price}円、${toipe.roll}個、${toipe.long}m、${toipe.date}`);
                    centerDiv.append(hedderDiv, detailDiv);
                    li.append(rankDiv, centerDiv, oneClearBtn);
                    liArray.push(li);
                    // lastCospaを更新
                    lastCospa = toipe.cospa;
                }
                // ランキング要素の子要素を、lists配列を展開して置き換える
                document.querySelector(this.rankingSelector).replaceChildren(...liArray);
                // 各li要素の削除ボタンのリスナーにoneClearHandlerを登録
                this.oneClearBtnList = document.querySelectorAll(".one-clear-btn");
                this.oneClearBtnList.forEach(ocb => {
                    ocb.addEventListener("click", (e) => this.oneClearHandler(e));
                });
            }
        }

        sortSaveToipes() {
            // toipes配列をcospa順にソートし、localStorageに保存するメソッド
            this.toipes.sort((a,b) => a.cospa-b.cospa);
            // toipes配列をシリアライズしてlocalStorageに保存
            localStorage.setItem(this.storageName, JSON.stringify(this.toipes));
        }

        sendHandler() {
            // フォームの情報から新たなtoipeオブジェクトをつくるメソッド
            // toipeの配列を初期化
            this.toipesInit();
            // 入力情報取得＆計算
            let form = document.forms.form;
            let name = this.sanitizeString(form.product_name.value);
            let long = parseFloat(this.sanitizeString(form.long.value));
            let roll = parseFloat(this.sanitizeString(form.roll.value));
            let price = parseFloat(this.sanitizeString(form.price.value));
            let cospa = (price / roll / long).toFixed(3);
            let now = new Date();
            let date = now.toLocaleString();
            // 算出されたcospaが数字でなかったり、マイナスだったらアラート
            if (isNaN(cospa) || cospa < 0) {
                window.alert("入力値が不正です。");
            } else {
                // フォームの入力欄を初期化
                form.product_name.value = "";
                form.long.value = "";
                form.roll.value = "";
                form.price.value = "";
                // toipeオブジェクト作成しtoipes配列に追加
                let toipe = {
                    name: name,
                    long: long,
                    roll: roll,
                    price: price,
                    cospa: cospa,
                    date: date,
                }
                this.toipes.push(toipe);
                // 新規追加のなので状態変数をtrueに
                this.newAddition = true;
                // cospa順にソートして保存、新しいランキングを作り置き換える。
                this.sortSaveToipes();
                this.makeRanking();
            }
        }

        sanitizeString(str) {
            // 引数の文字列をサニタイズして返すメソッド
            return String(str)
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#x27;")
                .replace(/`/g, "&#x60;");
        }

        clearHandler() {
            // localStorageやランキングのhtml要素を削除するメソッド
            if (window.confirm("本当に履歴を消去しますか？")) {
                // localStorage消去
                localStorage.clear();
                // rankingの子要素をすべて削除
                let ranking = document.querySelector(this.rankingSelector);
                while(ranking.firstChild) {
                    ranking.removeChild(ranking.firstChild);
                }
            }
        }

        oneClearHandler(e) {
            // 押されたoneClearBtnに対応するtoipeを削除するメソッド
            // 押されたButton要素のidを取得
            let btn = e.target;
            let id = btn.id;
            // confirmで表示するテキストをDOM要素から取り出して組み立てる
            let rankDiv = document.querySelector(`.${id} div`);
            let hedderDiv = rankDiv.nextElementSibling.firstChild;
            let confirmSentence = `"${rankDiv.textContent} ${hedderDiv.textContent}"を削除しますか？`;
            // idから先頭の"index"を取り除いてindex番号を取得
            let index = id.toString();
            index = Number(index.slice(5));
            // okなら当該要素を削除する
            if (window.confirm(confirmSentence)) {
                // toipes配列から当該要素を削除
                this.toipes.splice(index,1);
                // ソートしlocalStorageへ保存、ランキングを生成する
                this.sortSaveToipes();
                this.makeRanking();
            }
        }
    }

    new ToipeCospa();  
});