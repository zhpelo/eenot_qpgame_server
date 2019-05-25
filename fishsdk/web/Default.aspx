<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>


<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>::  Bkk126 ::</title>
	<meta http-equiv="Pragma" content="no-cache">
	<meta http-equiv="Expires" content="-1">
	<link href="./css/styles-en.css" type="text/css" rel="stylesheet">
	
	<script language="JavaScript" type="text/JavaScript">
	    /**************************************************************** START Time Container Function ****************************************************************/

	    /***********************************************
	    * Local Time script- © Dynamic Drive (http://www.dynamicdrive.com)
	    * This notice MUST stay intact for legal use
	    * Visit http://www.dynamicdrive.com/ for this script and 100s more.
	    ***********************************************/

	    var weekdaystxt = ["日", "一", "二", "三", "四", "五", "六"]
	    //var monthstxt = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	    var monthstxt = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

	    function showLocalTime(container, servermode, offsetMinutes, displayversion) {
	        if (!document.getElementById || !document.getElementById(container)) return
	        this.container = document.getElementById(container)
	        this.displayversion = displayversion
	        var servertimestring = (servermode == "server-php") ? '<? print date("F d, Y H:i:s", time())?>' : (servermode == "server-ssi") ? '<!--#config timefmt="%B %d, %Y %H:%M:%S"--><!--#echo var="DATE_LOCAL" -->' : '2016/06/03 10:02:50'
	        this.localtime = this.serverdate = new Date(servertimestring)
	        this.localtime.setTime(this.serverdate.getTime() + offsetMinutes * 60 * 1000) //add user offset to server time
	        this.updateTime()
	        this.updateContainer()
	    }

	    showLocalTime.prototype.updateTime = function () {
	        var thisobj = this
	        this.localtime.setSeconds(this.localtime.getSeconds() + 1)
	        setTimeout(function () { thisobj.updateTime() }, 1000) //update time every second
	    }

	    showLocalTime.prototype.updateContainer = function () {
	        var thisobj = this
	        if (this.displayversion == "long")
	            this.container.innerHTML = this.localtime.toLocaleString()
	        else {
	            var monthofyear = monthstxt[this.localtime.getMonth()]
	            var day = this.localtime.getDate();
	            var year = this.localtime.getFullYear();
	            var hour = this.localtime.getHours();
	            var ampm = (hour >= 12) ? " PM " : " AM "
	            if (hour > 12) {
	                hour = hour - 12;
	            }
	            var minutes = this.localtime.getMinutes()
	            var seconds = this.localtime.getSeconds()

	            var dayofweek = weekdaystxt[this.localtime.getDay()]
	            //this.container.innerHTML=formatField(hour, 1)+":"+formatField(minutes)+":"+formatField(seconds)+" "+ampm+" ("+dayofweek+")"
	            //this.container.innerHTML = dayofweek + ", " + monthofyear + " " + day + ", " + year + "&nbsp;&nbsp;&nbsp;&nbsp; " + hour + ":" + formatField(minutes) + ":" + formatField(seconds) + formatField(ampm) + " GMT+8"
	            this.container.innerHTML = monthofyear + "/" + day + "/" + year + " HK " + hour + ":" + formatField(minutes) + formatField(ampm);;
	        }
	        setTimeout(function () { thisobj.updateContainer() }, 1000) //update container every second
	    }

	    function formatField(num, isHour) {
	        if (typeof isHour != "undefined") { //if this is the hour field
	            var hour = (num > 12) ? num - 12 : num
	            return (hour == 0) ? 12 : hour
	        }
	        return (num <= 9) ? "0" + num : num//if this is minute or sec field
	    }

	    /**************************************************************** END Time Container Function ****************************************************************/
    </script>
	<script language="JavaScript" type="text/JavaScript">
    <!--
    function MM_jumpMenu(targ, selObj, restore) { //v3.0
        eval(targ + ".location='" + selObj.options[selObj.selectedIndex].value + "'");
        if (restore) selObj.selectedIndex = 0;
    }

    function MM_preloadImages() { //v3.0
        var d = document; if (d.images) {
            if (!d.MM_p) d.MM_p = new Array();
            var i, j = d.MM_p.length, a = MM_preloadImages.arguments; for (i = 0; i < a.length; i++)
                if (a[i].indexOf("#") != 0) { d.MM_p[j] = new Image; d.MM_p[j++].src = a[i]; }
        }
    }

    function MM_swapImgRestore() { //v3.0
        var i, x, a = document.MM_sr; for (i = 0; a && i < a.length && (x = a[i]) && x.oSrc; i++) x.src = x.oSrc;
    }

    function MM_findObj(n, d) { //v4.01
        var p, i, x; if (!d) d = document; if ((p = n.indexOf("?")) > 0 && parent.frames.length) {
            d = parent.frames[n.substring(p + 1)].document; n = n.substring(0, p);
        }
        if (!(x = d[n]) && d.all) x = d.all[n]; for (i = 0; !x && i < d.forms.length; i++) x = d.forms[i][n];
        for (i = 0; !x && d.layers && i < d.layers.length; i++) x = MM_findObj(n, d.layers[i].document);
        if (!x && d.getElementById) x = d.getElementById(n); return x;
    }

    function MM_swapImage() { //v3.0
        var i, j = 0, x, a = MM_swapImage.arguments; document.MM_sr = new Array; for (i = 0; i < (a.length - 2) ; i += 3)
            if ((x = MM_findObj(a[i])) != null) { document.MM_sr[j++] = x; if (!x.oSrc) x.oSrc = x.src; x.src = a[i + 2]; }
    }
    //-->
    </script>

    <script language="JavaScript" type="text/JavaScript">
        function PopupCenter(pageURL, title, w, h) {
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            var targetWin = window.open(pageURL, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }
    </script>

    <script type="text/javascript" language="javascript">
        //Clear cookies
        document.cookie = "hideHeader=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

        function changeBox() {
            document.getElementById('div1').style.display = 'none';
            document.getElementById('div2').style.display = '';
            document.getElementById('password').focus();
        }

        function restoreBox() {
            if (document.getElementById('password').value == '') {
                document.getElementById('div1').style.display = '';
                document.getElementById('div2').style.display = 'none';
            }
        }

        function clearText(field) {
            if (field.defaultValue == field.value) field.value = '';
            else if (field.value == '') field.value = field.defaultValue;
        }

        function openContent(id) {
            if (id == "index") {
                document.getElementById("_iContent").src = "demo.html";
            }
            else if (id == "AboutUs") {
                document.getElementById("_iContent").src = "html/about.html";
            }
            else if (id == "BettingRules") {
                document.getElementById("_iContent").src = "html/rules.html";
            }
            else if (id == "Faq") {
                document.getElementById("_iContent").src = "html/help.html";
            }
            else if (id == "ContactUs") {
                document.getElementById("_iContent").src = "html/contact.html";
            }
            else if (id == "WhyChooseUs") {
                document.getElementById("_iContent").src = "html/why.html";
            }
        }

        function resizeIframe(obj) {
            obj.style.height = 0;
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 8 + 'px';
        }

        function MM_openBrWindow(theURL, winName, features) { //v2.0
            window.open(theURL, winName, features);
        }

    </script>
</head>
<body bgcolor="#000000" background="./images/07.jpg" style="margin:0;">
<form id="form1" runat="server" method="post">
<!--div>
<input type="hidden" name="__EVENTTARGET" id="__EVENTTARGET" value="">
<input type="hidden" name="__EVENTARGUMENT" id="__EVENTARGUMENT" value="">
<input type="hidden" name="__VIEWSTATE" id="__VIEWSTATE" value="/wEPDwULLTE5MDM5NzA3MzlkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYBBQpidG5TaWduSW4ymeDYKsMh4x5Ig3Ck3BDDYihoKtw=">
</div-->

<script type="text/javascript">
    //<![CDATA[
    var theForm = document.forms['form1'];
    if (!theForm) {
        theForm = document.form1;
    }
    function __doPostBack(eventTarget, eventArgument) {
        if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
            theForm.__EVENTTARGET.value = eventTarget;
            theForm.__EVENTARGUMENT.value = eventArgument;
            theForm.submit();
        }
    }
    //]]>
</script>
 <script type="text/javascript" language="javascript">
        function iFrameHeight() {
            var ifm = document.getElementById("_iContent");
            var subWeb = document.frames ? document.frames["_iContent"].document : ifm.contentDocument;
            if (ifm != null && subWeb != null) {
                ifm.height = subWeb.body.scrollHeight;
                ifm.width = subWeb.body.scrollWidth;
            }
        }
</script>

<script language="JavaScript">function SetInitialFocus() { document.form1['txtUserName'].focus(); } window.onload = SetInitialFocus;</script>
<!--div>

	<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="594E7FC1">
	<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="/wEWBwLg4amSBgKGsJjNBQKl1bKzCQLzlKGwCgLyveCRDwLD94uUBwLD98OUB4M76LplFXd9NhfS2m88z8GyBhBL">
</div-->
<div style="overflow:hidden; display:none;">
    <iframe src="./Maintenance.html"></iframe>
</div>

<table width="1000" border="0" align="center" cellpadding="0" cellspacing="0">
    <tbody><tr><td height="120" align="right" valign="top" background="./images/01.jpg">
        <table width="745" border="0" cellspacing="0" cellpadding="0">
            <tbody><tr><td height="45" align="right">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody><tr>
                        <td width="40"><img src="./images/05.png" width="33" height="33"></td>
                        
                        <td class="class1">&nbsp;</td>
                        <td width="50" align="right"><span onclick="PopupCenter(&#39;Images/ZH-CN/popup/doc/android.html&#39;, &#39;myPop1&#39;,843,645);" href="javascript:void(0);"><a href="http://www.Bkk126.com/Default.aspx?lang=ZH-CN#"><img src="./images/07.png" width="33" height="33" border="0"></a></span></td>
                        <td align="right">
                            
                            <table border="0" cellspacing="0" cellpadding="0">

                            <tbody><tr>
                                <td><table border="0" cellpadding="0" cellspacing="0">
                                    
                                    <tbody><tr>
                                        <td height="25" align="center">
                                            <asp:Label ID="Label2" runat="server" ForeColor="Red"></asp:Label>
                                            
                                            <select name="lstLang" id="lstLang" style="font-size:small; height:20px;" onchange="top.location.href = document.form1.lstLang.options[document.form1.lstLang.selectedIndex].value; return false;">
	<option value="Default.aspx?lang=EN-US">ENGLISH</option>
	<option selected="selected" value="Default.aspx?lang=ZH-CN">中文</option>
	<option value="Default.aspx?lang=EN-GB">ภาษาไทย</option>
	<option value="Default.aspx?lang=EN-IE">Tiếng Việt</option>
	<option value="Default.aspx?lang=EN-AU">INDONESIAN</option>
	<option value="Default.aspx?lang=JA-JP">日本語</option>
	<option value="Default.aspx?lang=EN-TT">KOREAN</option>
</select>
                                        </td>
                                        <td style="width:5px;"></td>
                                        <td style="width:320px;">
                                            <!----------------------------------------------- Login Part BEGIN ----------------------------------------------->
                                            <table width="100%" height="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tbody><tr>
	                                            <td width="120px">
                                                    <asp:TextBox ID="TextBox1" runat="server" Text=""></asp:TextBox>
                                                    <asp:Label ID="UserName" runat="server"></asp:Label>
	                                                <!--input name="txtUserName" type="text" id="txtUserName" onfocus="clearText(this)" onblur="clearText(this)" value="户口" tabindex="1" style="width:120px;" class="UsernameCss"-->
	                                            </td>
                                                
	                                            <td style="width:5px;"></td>
	                                            <td width="120px">
	                                                <div id="div1">
                                                        <asp:TextBox ID="TextBox2" runat="server" Text="" ></asp:TextBox>
                                                        <asp:Button ID="Button2" runat="server" Text="进入游戏大厅" ForeColor="White" BackColor="Black" Width="100px" OnClick="AgLogin_Click" />
                                                        <!--input name="Text1" type="text" id="Text1" value="密码" onfocus="changeBox()" tabindex="2" style="width:120px;" class="PasswordCss"-->
                                                    </div>
	                                            </td>
	                                            <td style="width:5px;"></td>
                                            </tr>
                                            </tbody></table>
                                        <!----------------------------------------------- Login Part END ----------------------------------------------->
                                        </td>
                                    </tr>
                                </tbody></table></td>
                                <td class="class1" width="70" height="25" align="center">
                                    <asp:Button ID="Button1" runat="server" Text="登入" ForeColor="White" BackColor="Black" Width="80px" OnClick="Login_Click" />
                                    <asp:Button ID="Button3" runat="server" Text="退出" ForeColor="White" BackColor="Black" Width="80px" OnClick="LoOut_Click" />
                                    <!--a id="btnSignIn" tabindex="5" href="javascript:__doPostBack('1','')" style="display:inline-block;width:70px;vertical-align:middle; text-align:center; line-height:22px">登入</a>
                                    <input type="image" name="btnSignIn2" id="btnSignIn2" tabindex="6" src="./images/blank.gif" style="height:0px;width:0px;border-width:0px;"-->
                                </td>
                            </tr>
                        </tbody></table></td>
                    </tr>
                </tbody></table>
            </td></tr>
            <tr><td height="50" valign="bottom">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tbody><tr>
                        <td><table width="620" border="0" cellpadding="0" cellspacing="0">
                            <tbody><tr>
                                <td width="70" height="45" align="center"><span class="class1"><a href="#" onclick="openContent(&#39;index&#39;)">主场</a></span></td>
                                <td height="45" align="center"><span class="class1"><a href="#" onclick="openContent(&#39;AboutUs&#39;)">关于我们</a></span></td>
                                <td align="center"><span class="class1"><a href="#" onclick="openContent(&#39;BettingRules&#39;)">投注规则</a></span></td>
                                <td align="center"><span class="class1"><a href="#" onclick="openContent(&#39;Faq&#39;)">帮助中心</a></span></td>
                                <td align="center"><span class="class1"><a href="#" onclick="openContent(&#39;ContactUs&#39;)">联络我们</a></span></td>
                                <td align="center"><span class="class1"><a href="#" onclick="openContent(&#39;WhyChooseUs&#39;)">为何选着我们</a></span></td>
                            </tr>
                        </tbody></table></td>
                        <td class="class1" width="107" align="center"></td>
                    </tr>
                </tbody></table>
            </td></tr>
        </tbody></table>
    </td></tr>
    <tr><td>
        <iframe id="_iContent" frameborder="0" scrolling="no" src="./demo.html" width="100%" onload="resizeIframe(this);" allowtransparency="true" style="height: 554px;" ></iframe>
    </td></tr>
    <tr><td height="60" align="center">
        <img src="./images/03.jpg" width="580" height="30">
    </td></tr>
    <tr><td height="30" align="center">
        <span style="font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #666;">Copyright © Bkk126.com  All rights reserved.</span>
    </td></tr>
</tbody></table>
    

</form>


</body></html>