<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Game.aspx.cs" Inherits="Game" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
</head>

<body bgcolor="#472101">
<style>
    *{ margin:0px; padding:0px;}
    .auto-style1 {
        width: 158px;
    }

    .upText {
        font-size: 25px;
        font-weight: 900;
        color:#FFFFFF;
    }

    .TextImage{
        font-size: 30px;
        font-weight: 900; 
        Z-INDEX: 101;
        LEFT: 160px;
        POSITION: relative;
        TOP: -40px;
        TEXT-ALIGN: center;
        color:#472101;
    }

    .TextImage2{
        font-size: 30px;
        font-weight: 900; 
        color:#FFFFFF;
    }

    .Ti{
        font-size: 25px;
        font-weight: 900;
        color:#FF9400;
    }
    .auto-style2 {
        width: 380px;
    }
    .auto-style3 {
        width: 380px;
        text-align: center;
    }
</style>
    <form id="form1" runat="server">
        <table width="100%" height="100%">
            <tr background="images/game/image1.png" height ="82px" >
                <td class="auto-style1">
                    <table>
                        <tr>
                            <td width ="30px"></td>
                            <td width ="130px">
                                <asp:Image ID="Image1" runat="server" ImageUrl="~/images/vip.png" height ="75px" />
                            </td>
                            <td width ="270px" class="upText" align="center"><asp:Label ID="Username" runat="server" Text="Label"></asp:Label></td>
                            <td width ="240px" class="upText"></asp:Label>
                                信用额度:<asp:Label ID="AccountAmount" runat="server" Text="Label"></asp:Label>
                                <asp:ImageButton ID="rush" runat="server" ImageUrl="~/images/pix/19.png" />
                            </td>
                            <td>
                                <table>
                                    <tr>
                                        <td>
                                            <asp:Button id="Button7" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="修改密码" Font-Size="Large"></asp:Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <asp:Button id="Logout" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="退出登录" Font-Size="Large" OnClick="Logout_Click"></asp:Button>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <tr height ="100%">
                <td  align="left" valign="top">
                    <table width ="980px">
                        <tr height ="10px"><td></td><td class="auto-style2"></td><td></td><td></td><td></td></tr>
                        <tr height="327px">
                            <td width ="30px"></td>
                            <td class="auto-style3" style="background-color: #231000">
                                <asp:ImageButton ID="Sports" runat="server" ImageUrl="~/images/Game/icon1.png" OnClick="Sports_Click"/>
                                <br />
                              <asp:Label ID="SportAccountAmount" class="TextImage2" runat="server" Text="Label"></asp:Label>
                            </td>
                            <td width="30px">

                            </td>
                            <td class="auto-style3" style="background-color: #231000">
                                <asp:ImageButton ID="Button2" runat="server" ImageUrl="~/images/Game/icon2.png" OnClick="Button2_Click"/>    
                                <br />
                                <asp:Label ID="FishAccountAmount" class="TextImage2" runat="server" Text="Label"></asp:Label>
                            </td>
                            <td>

                            </td>
                        </tr>
                        <tr>
                            <td ></td>
                            <td align="center" class="auto-style2">
                                <div class="Ti">请填写上下的数值：</div>
                            </td>
                            <td></td>
                            <td align="center">
                                <div class="Ti">请填写上下的数值：</div>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td align="center" class="auto-style2">
                                <asp:TextBox ID="TextBox1" runat="server" Height="30px"></asp:TextBox>
                            </td>
                            <td ></td>
                            <td align="center">
                                <asp:TextBox ID="TextBox2" runat="server" Height="30px"></asp:TextBox>
                            </td>
                            <td></td>
                        </tr>

                        <tr>
                            <td ></td>
                            <td align="center" class="auto-style2">
                                <asp:Button id="Button3" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="上分" Font-Size="Large" OnClick="Sports_up"></asp:Button>
                                <asp:Button id="Button5" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="下分" Font-Size="Large" OnClick="Sports_down"></asp:Button>
                                <input id="hidden" type="hidden" value="<%= GetToken() %>" name="hiddenTestN"/>
                            </td>
                            <td ></td>
                            <td align="center">
                                <asp:Button id="Button4" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="上分" Font-Size="Large" OnClick="Fish_up"></asp:Button>
                                <asp:Button id="Button6" style="BACKGROUND-IMAGE: url(../images/game/button.png); WIDTH: 126px; BACKGROUND-REPEAT: no-repeat; HEIGHT: 28px" runat="server" Text="下分" Font-Size="Large" OnClick="Fish_down"></asp:Button>
                            </td>
                            <td></td>
                        </tr>

                    </table>
                </td>
            </tr>
            
        </table>


    </form>
</body>
</html>
