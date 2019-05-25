<%@ Page Language="C#" AutoEventWireup="true" CodeFile="Default.aspx.cs" Inherits="_Default" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title></title>
</head>
<body>
    <form id="form1" runat="server">


    <div>
        <asp:Button ID="Button1" runat="server" Text="注册" OnClick="Button1_Click" />
        <asp:Button ID="Button2" runat="server" Text="加钱" OnClick="Button2_Click" />
        <asp:Button ID="Button3" runat="server" Text="查询" OnClick="Button3_Click" />
        <asp:Button ID="Button4" runat="server" Text="重置" OnClick="Button4_Click" />
        <asp:Button ID="Button5" runat="server" Text="余额" OnClick="Button5_Click" />
        <asp:Button ID="Button11" runat="server" Text="标记" OnClick="Button11_Click" />
        <asp:Label ID="Label1" runat="server" Text="Label">ID</asp:Label>
        <asp:TextBox ID="TextBox1" runat="server" Width="66px"></asp:TextBox>
        <asp:Label ID="Label4" runat="server" Text="Label">赠送金币</asp:Label>
        <asp:TextBox ID="TextBox2" runat="server"></asp:TextBox>给渔夫
        <asp:Button ID="Button12" runat="server" Text="赠送" OnClick="Button12_Click" />
        <asp:Label ID="Label5" runat="server" Text="Label"></asp:Label>
    </div>

        
        <p>


        <asp:Button ID="Button6" runat="server" Text="在线列表" OnClick="Button6_Click" /><asp:Button ID="Button7" runat="server" Text="输赢情况" OnClick="Button7_Click" /><asp:Button ID="Button8" runat="server" Text="修改概率" OnClick="Button8_Click" /><asp:Button ID="Button9" runat="server" Text="维护(不踢人)" OnClick="Button9_Click" style="margin-top: 0px" /><asp:Button ID="Button10" runat="server" Text="关闭服务" OnClick="Button10_Click" />
        </p>
        <p>
        <asp:label runat="server" text="在线人数:"></asp:label> <asp:label runat="server" text="0" ID="Lable1"></asp:label>输赢:<asp:Label ID="Label2" runat="server" Text="0"></asp:Label> 摇奖次数:<asp:Label ID="Label3" runat="server" Text="0"></asp:Label>
        </p>
        <asp:ListBox ID="ListBox1" runat="server" Height="316px" Width="194px"></asp:ListBox>
    </form>
</body>

</html>
