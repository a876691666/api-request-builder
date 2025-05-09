#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 读取命令行参数，确定版本类型
const args = process.argv.slice(2);
const versionType = args[0] || 'patch'; // 默认为patch版本
const validVersionTypes = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];

if (!validVersionTypes.includes(versionType)) {
  console.error(`错误: 无效的版本类型 '${versionType}'`);
  console.log(`有效的版本类型: ${validVersionTypes.join(', ')}`);
  process.exit(1);
}

/**
 * 执行shell命令并打印输出
 * @param {string} command 要执行的命令
 * @param {string} errorMessage 错误时显示的消息
 */
function runCommand(command, errorMessage) {
  try {
    console.log(`执行: ${command}`);
    const output = execSync(command, { cwd: rootDir, stdio: 'inherit' });
    return output;
  } catch (error) {
    console.error(`${errorMessage}: ${error}`);
    process.exit(1);
  }
}

// 确保当前分支是main或master
let currentBranch;
try {
  currentBranch = execSync('git branch --show-current', { cwd: rootDir }).toString().trim();
} catch (error) {
  console.error('无法获取当前Git分支:', error);
  process.exit(1);
}

if (currentBranch !== 'main' && currentBranch !== 'master') {
  console.warn(`警告: 你当前不在main或master分支上，而是在 '${currentBranch}' 分支上。`);
  const proceed = args.includes('--force');
  
  if (!proceed) {
    console.error('发布应该从main或master分支进行。如果你确定要继续，请添加 --force 参数。');
    process.exit(1);
  }
  console.warn('使用 --force 参数，继续进行发布流程...');
}

// 确保工作目录干净
try {
  const status = execSync('git status --porcelain', { cwd: rootDir }).toString().trim();
  if (status) {
    console.error('错误: 工作目录不干净。请提交或暂存所有更改后再发布。');
    console.log(status);
    process.exit(1);
  }
} catch (error) {
  console.error('无法检查Git状态:', error);
  process.exit(1);
}

// 更新版本号
console.log(`\n开始更新${versionType}版本...`);
runCommand(`npm version ${versionType} --no-git-tag-version`, '更新版本失败');

// 读取更新后的package.json获取新版本号
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
} catch (error) {
  console.error('读取package.json失败:', error);
  process.exit(1);
}

const newVersion = packageJson.version;
console.log(`版本已更新到 ${newVersion}`);

// 构建项目
console.log('\n开始构建项目...');
runCommand('npm run build:all', '构建项目失败');

// 提交更改
console.log('\n提交版本更改...');
runCommand('git add package.json', '添加package.json到暂存区失败');
runCommand('git add docs/', '添加docs/到暂存区失败');
runCommand(`git commit -m "release: v${newVersion}"`, '提交更改失败');

// 添加标签
console.log('\n添加Git标签...');
runCommand(`git tag v${newVersion}`, '添加标签失败');

// 推送到远程仓库
console.log('\n推送更改和标签到远程仓库...');
runCommand('git push', '推送更改失败');
runCommand('git push --tags', '推送标签失败');

console.log(`\n🎉 成功发布版本 v${newVersion}!`);
console.log('GitHub Pages内容已更新，请在GitHub仓库设置中确保已启用GitHub Pages');
