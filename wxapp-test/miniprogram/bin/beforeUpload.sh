#! /usr/bin/env sh
# 检查分支是否为主分支
br_name=$(git symbolic-ref --short HEAD);
if [ $br_name != "master" ]
then
  echo -e "\e[1;33;31m [错误] ERROR \e[0m"
  echo -e "\e[1;33;31m 当前分支名为 $br_name 但是上传包必须是在 master 分支 \e[0m"
  exec /bin/bash
  exit 42;
fi
# 检查分支上是否有未提交的代码
if [[ ! -z $(git status --porcelain) ]]
then
  echo -e "\e[1;33;31m [错误] ERROR \e[0m"
  echo -e "\e[1;33;31m 你有未提交的代码，上传包前请将代码提交到仓库 \e[0m"
  exec /bin/bash
  exit 42;
fi
# 最后自动提交到远端仓库
git push;
