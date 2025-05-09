# 自动发版流程

此项目配置了自动发版脚本，用于简化版本发布和GitHub Pages部署流程。

## 使用方法

项目支持以下发布命令：

```bash
# 发布补丁版本 (v0.2.2 -> v0.2.3)
npm run release

# 发布次要版本 (v0.2.2 -> v0.3.0)
npm run release:minor

# 发布主要版本 (v0.2.2 -> v1.0.0)
npm run release:major
```

## 发布流程

发布脚本会自动执行以下操作：

1. 检查当前是否在main或master分支上（可通过--force参数绕过此检查）
2. 检查工作目录是否干净（没有未提交的更改）
3. 根据指定的版本类型更新package.json中的版本号
4. 执行项目构建（包括库构建和静态网站构建）
5. 创建一个包含更新版本的Git提交
6. 创建对应的Git标签
7. 推送更改和标签到远程仓库

## GitHub Pages

docs/目录包含GitHub Pages的部署内容。发布后，此目录的更改会被推送到远程仓库，GitHub将自动更新Pages网站。

请确保在GitHub仓库设置中已正确配置GitHub Pages，选择了正确的分支和/docs目录作为发布源。
