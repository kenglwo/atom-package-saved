# cd ${cwd_path};
if !(type git > /dev/null 2>&1); then
	# gitをインストールする処理
	echo 'install git';
else
	# gitがインストールされている場合
	if [ -e ./.git ]; then # cwdをgit管理している場合
		git add *;
		git commit -m "commit log";
		# cp -r .git ${studentId}.git;
		cp -r .git test.git;
		sftp kento@10.83.53.46:git << EOF
		put -r test.git
		quit
		EOF
	else #cwdをgit管理していない場合
		git init;
		git add *;
		git commit -m "initial commit";
		cp -r .git ${studentId}.git;
		sftp ${loginName}@${serverUrl} << EOF
		cd git
		put -r ${studentId}.git
		quit
		EOF
	fi
fi
