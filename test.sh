if !(type git > /dev/null 2>&1); then
	# gitをインストールする処理
	echo 'install git';
else
	# gitがインストールされている場合
	if [ -e ./.git ]; then # cwdをgit管理している場合
		echo "cwd is under git" > if_commit.txt;
		git add *;
		git commit -m "commit log";
	else #cwdをgit管理していない場合
		echo "cwd is NOT under git" > if_commit.txt;
		git init;
		git add *;
		git commit -m "initial commit";
	fi
fi
