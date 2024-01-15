const fse = require('fs-extra')
const inquirer = require('inquirer')
const { glob } = require('glob')
const ejs = require('ejs')

async function ejsRender(options) {
  const dir = options.targetPath;
  const projectInfo = options.data;
  const files = await glob('**', {
    cwd: dir,
    ignore: options.ignore || '',
    nodir: true
  })
  Promise.all(files.map((file) => {
    const filePath = path.join(dir, file);
    // console.log(filePath)
    return new Promise((resolve, reject) => {
      ejs.renderFile(filePath, projectInfo, {}, (err, result) => {
        // console.log(err, result)
        if (err) {
          reject(err)
        } else {
          fse.writeFileSync(filePath, result);
          resolve(result)
        }
      })
    })
  })).then(() => {

  }).catch(err => {
    throw err;
  })
  // console.log(files)
}

async function install(options) {
  const promptList = []
  const descriptionPrompt = {
    type: 'input',
    name: 'description',
    message: '请输入自定义模板描述信息',
    default: '',
    validate: function (v) {
      const done = this.async();

      setTimeout(function () {
        if (!v) {
          done('请输入自定义模板描述信息')
          return
        }
        done(null, true)
      }, 0)
    }
  }
  promptList.push(descriptionPrompt)
  const projectInfo = await inquirer.prompt(promptList)
  // console.log(projectInfo.description)
  options.projectInfo.description = projectInfo.description
  const { sourcePath, targetPath } = options
  try {
    fse.ensureDirSync(sourcePath)
    fse.ensureDirSync(targetPath)
    fse.copySync(sourcePath, targetPath)
  } catch (error) {
    throw error;
  } finally {
    // if (fs) {
    // }
  }
  const templteIgnore = options.templateInfo.ignore || []
  const ignore = ['node_modules/**', ...templteIgnore]
  await ejsRender({ ignore, targetPath, data: options.projectInfo });
  // // 依赖安装
  // const { installCommand, startCommand } = this.templateInfo
  // await this.execCommand(installCommand, '依赖安装过程失败')
  // await this.execCommand(startCommand, '启动命令过程失败')
}

module.exports = install;