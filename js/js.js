
function f1() {
    $(document).ready(function () {
        function Format(now,mask)
        {
            var d = now;
            var zeroize = function (value, length)
            {
                if (!length) length = 2;
                value = String(value);
                for (var i = 0, zeros = ''; i < (length - value.length); i++)
                {
                    zeros += '0';
                }
                return zeros + value;
            };

            return mask.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|m{1,4}|yy(?:yy)?|([hHMstT])\1?|[lLZ])\b/g, function ($0)
            {
                switch ($0)
                {
                    case 'd': return d.getDate();
                    case 'dd': return zeroize(d.getDate());
                    case 'ddd': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'][d.getDay()];
                    case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];
                    case 'M': return d.getMonth() + 1;
                    case 'MM': return zeroize(d.getMonth() + 1);
                    case 'MMM': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
                    case 'MMMM': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()];
                    case 'yy': return String(d.getFullYear()).substr(2);
                    case 'yyyy': return d.getFullYear();
                    case 'h': return d.getHours() % 12 || 12;
                    case 'hh': return zeroize(d.getHours() % 12 || 12);
                    case 'H': return d.getHours();
                    case 'HH': return zeroize(d.getHours());
                    case 'm': return d.getMinutes();
                    case 'mm': return zeroize(d.getMinutes());
                    case 's': return d.getSeconds();
                    case 'ss': return zeroize(d.getSeconds());
                    case 'l': return zeroize(d.getMilliseconds(), 3);
                    case 'L': var m = d.getMilliseconds();
                        if (m > 99) m = Math.round(m / 10);
                        return zeroize(m);
                    case 'tt': return d.getHours() < 12 ? 'am' : 'pm';
                    case 'TT': return d.getHours() < 12 ? 'AM' : 'PM';
                    case 'Z': return d.toUTCString().match(/[A-Z]+$/);
                    // Return quoted strings with the surrounding quotes removed
                    default: return $0.substr(1, $0.length - 2);
                }
            });
        };


        // Format(date,"yyyy-MM-dd HH:mm");
        var mydate = new Date();
    var t = mydate.toLocaleString();
    if(mydate.getMonth()<=9){
        m='0'+mydate.getMonth();
    }

        if(mydate.getHours()<=9){
            h='0'+mydate.getHours();
        }
        if(mydate.getDate()<=9){
            d='0'+mydate.getDate();
        }
        if(mydate.getMinutes()<=9){
            mi='0'+mydate.getMinutes();
        }
        if(mydate.getSeconds()<=9){
            s='0'+mydate.getSeconds();
        }
        if(mydate.getMonth()>9){
            m=mydate.getMonth();
        }

        if(mydate.getHours()>9){
            h=mydate.getHours();
        }
        if(mydate.getDate()>9){
            d=mydate.getDate();
        }
        if(mydate.getMinutes()>9){
            mi=mydate.getMinutes();
        }
        if(mydate.getSeconds()>9){
            s=mydate.getSeconds();
        }
    $("#time").html(mydate.getFullYear()+'年'+m+'月'+d+'日'+'<span>'+h+':'+mi+':'+s+'</span>');
    });
        var n = $("p.left_p2 span").text();

        if (n >= 50) {
            $("img.pointer").css({
                transform: 'rotate(' + (n - 50)/50*70 + 'deg)',
                '-webkit-transform': 'rotate(' + (n - 50)/50*70 + 'deg)',
                '-moz-transform': 'rotate(' + (n - 50)/50*70 + 'deg)',
                '-o-transform': 'rotate(' + (n - 50)/50*70 + 'deg)'
            })
        }
        else {
            $("img.pointer").css({
                transform: 'rotate(-' + (50 - n) / 50 * 70 + 'deg)',
                '-webkit-transform': 'rotate(-' + (50 - n) / 50 * 70 + 'deg)',
                '-moz-transform': 'rotate(-' + (50 - n) / 50 * 70 + 'deg)',
                '-o-transform': 'rotate(-' + (50 - n) / 50 * 70 + 'deg)'
            })
        }



}

t = setInterval(f1, 1000);

