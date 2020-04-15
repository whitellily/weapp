// 此文件用于小程序发布和提交体验版本
// 命令行配置文档为 https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html#%E8%87%AA%E5%8A%A8%E9%A2%84%E8%A7%88
const path = require('path')
const fs = require('fs')
const readline = require("readline")
const cp = require("child_process")
// const ChatBot = require('dingtalk-robot-sender');

const CONFIG = {
    CLI_PATH: 'C:/Program Files (x86)/Tencent/微信web开发者工具/cli.bat',
    PROJECT_PATH: 'E:/codePlace/wxapp-test/miniprogram',
    OUTPUT_PATH: 'E:/codePlace/wxapp-test/info.json'
}

// const robot = new ChatBot({
//     webhook: 'xxxxx'
// });




// open IDE
function init() {
    console.log('请等待微信开发者工具启动......')
    //console.log('Please ensure that you have set server port  correctly and had permission of developer.If you are getting trouble with this uploading process,you can contact with me,my wechat is tac_coolzjz.')
    return new Promise((resolve, reject) => {
        cp.exec(`cli open --project ${CONFIG.PROJECT_PATH}` , (error, stdout, stderr) => {
            if (error) {
                console.log('Failed to start IDE and open the project.')
                console.log(error)
                reject(error);
            }
            if(stderr){
                console.log(stderr)
            }
            console.log(stdout);
            resolve();
        })
    })

}

// enter information you want to commit.
function input() {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        rl.question('请输入备注和版本号，以空格分隔（版本号可不填默认为git tag latest）： \n', answer => {
            rl.close();
            if (answer.includes(' ')) {
                const [version, comment] = answer.split(' ')
                if ((!comment || !comment.length)) {
                    console.log('输入不合法，请重新输入')
                    resolve(input())
                } else {
                    console.log('版本号为：', version, '   备注为：', comment)
                    resolve({ version, comment })
                }
            } else {
                const comment = answer
                resolve({ comment })
            }
        })
    })
}

// login developer.
function login() {
    return new Promise((resolve, reject) => {
        const cmd = `cli login`
        console.log('login...')
        cp.exec(cmd, (error, stdout, stderr) => {
            console.log(error)
            console.log(stderr)
            console.log(stdout)
            resolve();
            //     console.log(error)
            // if (error) {
            //     console.log('error')
            //     console.log(error)
            //     // reject(error);
            // } else {
            //     if(stderr){
            //         console.log(stderr)
            //         console.log(stdout)
            //         resolve();
            //     }else{
            //         console.log('stdout:');
            //         console.log(stdout);
            //         console.log(stderr);
            //         console.log('开发者登录成功');
            //         resolve();
            //     }
            // }
        })
    })
}
// auto npm 构建.
function npmbuild() {
    return new Promise((resolve, reject) => {
        // const cmd = `cli -u ${version}@${CONFIG.PROJECT_PATH} --upload-desc ${comment}`
        const cmd = `cli build-npm --project ${CONFIG.PROJECT_PATH}`
        cp.exec(cmd,(error, stdout, stderr) => {
        // cp.execFile(CONFIG.CLI_PATH, cmd.split(' '), (error, stdout, stderr) => {
            if (error) {
                console.log('error');
                console.log(error);
                reject(error);
            } else {
                if(stderr){
                    console.log('stderr:');
                    console.log(stderr);
                    console.log(stdout);
                    resolve();
                }else{
                    console.log(stdout);
                    console.log(`npm构建成功`);
                    resolve(`npm构建成功resolve`);
                }
            }
        })
    })
}

// upload your code.
function upload(version, comment) {
    console.log('version', version, 'comment', comment)
    return new Promise((resolve, reject) => {
        // const cmd = `cli -u ${version}@${CONFIG.PROJECT_PATH} --upload-desc ${comment}`
        const cmd = `cli upload --project ${CONFIG.PROJECT_PATH} --version ${version} --desc "${comment}"`
        cp.exec(cmd, (error, stdout, stderr) => {
        // cp.execFile(CONFIG.CLI_PATH, cmd.split(' '), (error, stdout, stderr) => {
            if (error) {
                console.log('error')
                console.log(error)
                reject(error);
            } else {
                console.log(stderr);
                console.log(stdout);
                console.log(`小程序上传完成:${comment} - （版本号：${version}）`)
                resolve();
            }
        })
    })
}

// 提交git信息并加标签
async function gitCommit(version, commit, isUpdateTag = true) {
    cp.execSync('git add .')
    return new Promise((resolve, reject) => {
        cp.exec(`git tag`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else {
                const tags = stdout.split('\n')
                resolve(tags[tags.length - 2]);
            }
        })
    }).then((tag) => {
        if (tag) {
            const oldTag = tag
            const [a, b, c] = oldTag.split('.')
            const newTag = isUpdateTag ? (version && version.length ? version : [a, b, Number(c) + 1 || 0].join('.')) : oldTag;
            console.log('您的版本号为：', newTag, '您的提交信息为：', commit, '旧版本号为：', oldTag)
            return new Promise((resolve, reject) => {
                cp.exec(`git commit -m ${commit}`, (err, stdout, stderr) => {
                    if (err) {
                        console.log(err)
                        reject(err)
                    } else {
                        if (isUpdateTag) {
                            cp.execSync(`git tag ${newTag}`)
                        }
                        resolve(newTag)
                    }
                })
            })

        }
    })
        .catch((err) => {
            console.log('gitcommit 错误')
            throw err
        })


}

// 通知钉钉群
async function notify(msg, noAt = false) {
    let textContent = {
        "msgtype": "text",
        "text": {
            "content": msg
        },
        "at": {
            "atMobiles": [
                "xxxxxxxxxx",
                "xxxxxxxxxx"
            ],
            "isAtAll": false
        }
    }

    if (noAt) {
        delete textContent.at
    }

    await robot.send(textContent)

}


async function main() {
    try {
        const params = process.argv.slice(2)
        const isUpdateTag = !params.includes('-notag')
        const noAt = !params.includes('-noAt')
        // await init();
        // await login()
        await npmbuild()
        const { version, comment } = await input();
        // const newTag = await gitCommit(version, comment, isUpdateTag)
        // const msg = await upload(newTag, comment)
        await upload(version, comment)
        // await notify(msg, noAt)
        console.log('命令执行完毕！')
    } catch (e) {
        console.log('e', e)
    }
}

main();
