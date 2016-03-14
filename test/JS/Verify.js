function getLength(str) {
	return str.replace(/[^\x00-xff]/g, 'xx').length;
}

function findStr(str, n) {
	var tmp = 0;
	for (var i = 0; i < str.length; i++) {
		if (str.charAt(i) == n) {
			tmp++;
		}
	};
	return tmp;
}
window.onload = function() {
	var aInput = document.getElementsByTagName('input');
	var oName = aInput[0];
	var pwd1 = aInput[1];
	var pwd2 = aInput[2];
	var aP = document.getElementsByTagName('p');
	var name_msg = aP[0];
	var pwd1_msg = aP[1];
	var pwd2_msg = aP[2];
	var count = document.getElementById("count");
	var aEm = document.getElementsByTagName('em');
	var name_length = 0;


	//用户名
	//获取焦点
	oName.onfocus = function() {
		name_msg.style.display = 'block';
		name_msg.innerHTML = '<i class="ati">5-25个字符，一个汉字为两个字符，推荐使用中文会员名</i>'
	}

	oName.onkeyup = function() {
			count.style.visibility = 'visible';
			name_length = getLength(this.value);
			count.innerHTML = name_length + '个字符';
			if (name_length == 0) {
				count.style.visibility = 'hidden';
			};
		}
		// 失去焦点
	oName.onblur = function() {
		var re = /[^\w\u4e00-\u9fa5]/g;
		//含有非法字符
		if (re.test(this.value)) {
			name_msg.innerHTML = '<i class="err"></i> 含有非法字符';
		}
		//不能为空
		else if (this.value == "") {
			name_msg.innerHTML = '<i class="err"></i> 不能为空';
		}
		//长度大于25
		else if (name_length > 25) {
			name_msg.innerHTML = '<i class="err"></i> 长度不能超过25个字符';
		}
		//长度少于6 
		else if (name_length < 6) {
			name_msg.innerHTML = '<i class="err"></i> 长度不能少于6个字符';
		}
		//OK
		else {
			name_msg.innerHTML = 'OK!';
		}
	}

	//密码
	pwd1.onfocus = function() {
		pwd1_msg.style.display = 'block';
		pwd1_msg.innerHTML = '<i class = "ati"></i>6-16个字符，请使用字母加数字或符号的组合密码，不能单独使用字母、数字或符号。'
	}
	pwd1.onkeyup = function() {
		//大于5个字符 “中”
		if (this.value.length > 5) {
			aEm[1].className = 'active';
			pwd2.removeAttribute('disabled');
			pwd2_msg.style.display = 'block';
		} else {
			aEm[1].className = '';
			pwd2.setAttribute("disabled", "");
			pwd2_msg.style.display = 'none';
		};
		//大于10个字符“强”
		if (this.value.length > 10) {
			aEm[2].className = 'active';
		} else {
			aEm[2].className = '';
		};
	}
	pwd1.onblur = function() {
			var re_n = /[^\d]/g;
			var re_word = /[^a-zA-Z]/g;
			var m = findStr(pwd1.value, pwd1.value[0]);
			//不能为空
			if (this.value == "") {
				pwd1_msg.innerHTML = '<i class="err"></i>不能为空';
			}
			//不能使用相同字符
			else if (m == this.value.length) {
				pwd1_msg.innerHTML = '<i class="err"></i>不能使用相同字符';
			}
			//长度应为6-16个字符
			else if (this.value.length < 6 || this.value.length > 16) {
				pwd1_msg.innerHTML = '<i class="err"></i>长度应为6-16个字符';
			}
			//不能全为数字
			else if (!(re_n.test(this.value))) {
				pwd1_msg.innerHTML = '<i class="err"></i>不能全为数字';
			}
			//不能全为字母
			else if (!(re_word.test(this.value))) {
				pwd1_msg.innerHTML = '<i class="err"></i>不能全为字母';
			}
			//OK
			else {
				pwd1_msg.innerHTML = '<i class="ok"></i>OK!';
			}
		}
		//确认密码
	pwd2.onblur = function() {
		if (this.value != pwd1.value) {
			pwd2_msg.innerHTML = '<i class="err"></i>两次输入的密码不一致';
		} else {
			pwd2_msg.innerHTML = '<i class="ok"></i>OK!';
		}
	}

}