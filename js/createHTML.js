var fileContent = document.querySelector('.fileContent');
var pathIn = document.querySelector('.pathIn');
var path = document.querySelector('.path');
var checkedBuffer = {length:0};
var checkedAll =document.querySelector('.allChecked');
var currentItem  = fileContent.children;
var toolBtns = document.querySelector('.tool'); //工具栏按钮们的父级
var currentListId = 0; //当前需要显示的生成的文件夹ID
var deleteWrap = document.querySelector('.deleteWrap');//删除按钮
var wrap = document.querySelector('.wrap');//大框架 用于做高斯模糊
var moveToWrap  = document.querySelector('.moveToWrap ');//移动到窗口
var moveTarget = 0;  //移动到的目标
//创建指定data.id数据的文件（或者文件夹）
function createItemFile(dataContent){
    let newDiv = document.createElement('div');
    //注意 元素本身有id属性  不能设置自定义属性名为id  要设为newId
    newDiv.newId = dataContent.id;
    newDiv.style.backgroundImage = `url(${dataContent.icon ||"./images/icon/痴笑.png"})`
    newDiv.className = 'fileItem';
    newDiv.innerHTML = `
                        <span class="checkedBtn"></span>
                        <dfn class="fileItemName">
                            <span class="nowName">${dataContent.name}</span>
                            <input class="fileItemNameInput" type="text">
                        </dfn>
                        `;
                        // <span class="changeImg">更改图片</span>  暂时无法完成
    return newDiv;
}

//生成fileContent的内容  currentListId 是当前要生成的文件夹的id
function createFileContent(id){
    fileContent.innerHTML = '';
    var content = getChildrenById(data,id);
    var len  =content.length;
    fileContent.classList.remove('none');
    // console.log(content);
    for(var i = 0;i<len;i++){
        fileContent.appendChild(createItemFile(content[i]));
        }
    //如果没东西了 给fileContent添加class  none
    if(!len){
        fileContent.classList.add('none');
    }
    animation({
        el:fileContent,
        attrs:{
            scale:1
        },
        duration:200
    });
    checkedBuffer = {length:0};
    checkedAll.classList.toggle('checked',checkedBuffer.length === currentItem.length&&currentItem.length!==0);
    return currentListId = id;
};
//初始化生成根目录的文件夹 给filecontent添加transform scale(1) 生成面包屑导航
css(fileContent,'scale',1);
createFileContent(0);
createBredCurmb(0);
//鼠标画框
function creatCircle (e){
    var target = e.target;
    //鼠标画框事件fileContent
   e.preventDefault();
   if(target.classList.contains('fileContent')){
       var circle  =document.createElement('div');
       document.body.appendChild(circle);//如果添加到fileContent里 设置定位值会出现问题 需要计算
       circle.className = 'circle';
       var startX = e.pageX;
       var startY = e.pageY;
       var len = currentItem.length;
       document.onmousemove = function(e){
           var x = e.pageX, y = e.pageY;    
           var l = Math.min(x, startX);
           var t = Math.min(y, startY);
           var w = Math.abs(x - startX);
           var h = Math.abs(y - startY);  
           //检测是否超出了filecontent范围
           if(l<getRect(fileContent).left){
                l=getRect(fileContent).left;
                w = Math.abs(l - startX)
           }
           if(l+w>getRect(fileContent).right){
               w = getRect(fileContent).right-l;
           }
           if(t<getRect(fileContent).top){
               t=getRect(fileContent).top;
               h = Math.abs(t - startY)
           }
           if(t+h>getRect(fileContent).bottom){
               h = getRect(fileContent).bottom-t;
           }
           //碰撞检测
           for(var i=0; i<len; i++){
               if(duang(circle, currentItem[i])){
                   // console.log(currentItem[i].firstElementChild.isCanCircle)
                   checkedFn(currentItem[i].firstElementChild);
                   currentItem[i].firstElementChild.isCanCircle = true;
               }
               else{
                   if(currentItem[i].firstElementChild.isCanCircle === true){
                       currentItem[i].firstElementChild.isCanCircle = false;   
                       checkedFn(currentItem[i].firstElementChild);    
                   }
               }
             }
           circle.style.left = l + 'px';
           circle.style.top = t + 'px';
           circle.style.width = w + 'px';
           circle.style.height = h + 'px';
       }
       document.onmouseup = function (e){
           document.body.removeChild(circle);
           this.onmouseup = this.onmousemove = null;
           for(var i=0;i<len;i++){
               currentItem[i].firstElementChild.isCanCircle = false;
           }
         }
   }
}
fileContent.onmousedown = creatCircle;
//点击某个文件夹会进入  用事件委托
fileContent.addEventListener('click',function(e){
    var target = e.target;
    // console.log(target);
    if(target.classList.contains('fileItem')){
        //做一个动画效果  点击后缩放到0 然后创建 并且显示
        animation({
            el:fileContent,
            attrs:{
                scale:0
            },
            duration:200,
            cb:function(){
                // console.log(1);
                createFileContent(target.newId);
                createBredCurmb(target.newId);
            }
        })
    };
    //选中事件
    if(target.classList.contains('checkedBtn')){
        checkedFn(target);
    }
    //重命名事件
    if(target.classList.contains('nowName')){
        reName(target,target.parentNode.parentNode.newId);
    }
    //更换图片
    // if(target.classList.contains('changeImg')){
    //     changeImgFn(target.parentNode.newId);
    // }
})
//生成一个面包屑节点
function createBredNode(id){
    let bredNode = document.createElement('div');
    bredNode.newId = id;
    bredNode.className = `pathContent`;
    bredNode.innerHTML = `<span>${data[id].name}</span>`;
    return bredNode;
}
//生成整个面包屑导航
function createBredCurmb(id){
    var allParent = getAllParent(data,id);
    var len = allParent.length;
    pathIn.innerHTML = '';
    for(var i =0;i<len;i++){
        pathIn.appendChild(createBredNode(allParent[i].id));
    }
}
//事件委托 面包屑导航
path.addEventListener('click',function(e){
    var target = e.target;
    if(target.parentNode.newId !== undefined &&target.parentNode.parentNode.lastElementChild.newId !==target.parentNode.newId){
        animation({
            el:fileContent,
            attrs:{
                scale:0
            },
            duration:200,
            cb:function(){
                // console.log(1);
                createFileContent(target.parentNode.newId);
                createBredCurmb(target.parentNode.newId);       
                //控制全选按钮         
                checkedBuffer = {length:0};
                checkedAll.classList.toggle('checked',checkedBuffer.length === currentItem.length);
            }
        })
    };
    if(target.classList.contains('allChecked')){
        allCheckedFn();
    }
})
//单选全选  原理  声明一个缓存 每次点击length++  把点击的东西放进去 并且给上newId
function checkedFn(checkedItem){
    if(checkedItem.isCanCircle) return;
    var parent = checkedItem.parentNode;
    var newId = parent.newId;
    var isChecked = parent.classList.toggle('checked');
    if(isChecked){
        checkedBuffer.length++;
        checkedBuffer[newId] = parent;
    }else{
        checkedBuffer.length--;
        delete checkedBuffer[parent.newId];
    };
    //如果全选了就添加  否则移出 利用toggle第二个参数
    checkedAll.classList.toggle('checked',checkedBuffer.length === currentItem.length);

}
function allCheckedFn(){
    var isChecked = checkedAll.classList.toggle('checked');
    isAllCheckedFn(isChecked);
}
function isAllCheckedFn(isChecked){
    const len = currentItem.length;
    if(isChecked){
        checkedBuffer.length = len;
    }else{
        checkedBuffer = {length:0};
    }
    for(let i=0;i<len;i++){
        if(isChecked){
            if(checkedBuffer[currentItem[i].newId]===undefined)//如果本来已经选中了的话就不执行
            checkedBuffer[currentItem[i].newId] = currentItem[i];
            currentItem[i].classList.add('checked');
        }else{
            currentItem[i].classList.remove('checked');
        }  
    }
}
//删除功能  选中之后可以删除并删除这个元素的所有子元素  然后重新生成
//删除 创建遮罩提示框函数
function createMaskFn(text){
    var mask  =document.createElement('div');
    mask.className = 'deleteSure';
    mask.innerHTML = `
                        <div class="deleteSure">
                            <dfn>
                                <i class="close"></i>
                                <span class="deleteInfo">${text}</span>
                                <i class="cancelBtn">取消</i>
                                <i class="sureBtn">确定</i>
                            </dfn>
                        </div>  
                   `
    return mask;
}
//移动到创建
function createMoveToFn(db,id = 0){
    const data = db[id];
    //获取一共有多少父级 决定他的paddingleft
    const floorIndex = getAllParent(db, id).length;
    //获取一共有多少一级子元素
    const children = getChildrenById(db, id);
    const len = children.length;
    var str = '';
    str +=`<ul class="moveToUl">
                <li class="moveToLi">
                    <div data-file-id="${data.id}" class="moveToDiv ${currentListId===id ? 'active':''}" style="padding-left: ${(floorIndex-1)*25}px;" data-set-id>
                        <i data-file-id="${data.id}" class="filePathIcon active"></i>
                        <span data-file-id="${data.id}" class="filePathName">${data.name}</span>
                    </div>
                `
    //判断有没有子集  循环
    if(len){
        for(var i=0;i<len;i++){
            str+=createMoveToFn(db,children[i].id);
        }
    };
    str +=`</li>
        </ul>`;
    return str;
}
function changeImgFn(nowItemId){
    // deleteWrap.classList.add('active');
    // wrap.classList.add('delete');
    // deleteWrap.innerHTML = `<div class="deleteSure">
    //                             <dfn>
    //                                 <i class="close"></i>
    //                                 <input class="deleteInfoInp" value="${data[nowItemId].icon ||'./images/icon/痴笑.png'}">
    //                                 <i class="cancelBtn">取消</i>
    //                                 <i class="sureBtn">确定</i>
    //                             </dfn>
    //                         </div>`
    // deleteWrap.addEventListener('click',isSure);
    // function isSure(e){
    //     var target = e.target
    //     if(target.classList.contains('close')||target.classList.contains('cancelBtn')){
    //         wrap.classList.remove('delete');
    //         deleteWrap.classList.remove('active');
    //         deleteWrap.removeEventListener('click',isSure);
    //         return ;
    //     }
    //     if(target.classList.contains('sureBtn')){
    //         var deleteInfoInp  =deleteWrap.querySelector('.deleteInfoInp');
    //         console.log(deleteInfoInp.value)
    //         createFileContent(currentListId);
    //         wrap.classList.remove('delete');
    //         deleteWrap.classList.remove('active');
    //         deleteWrap.removeEventListener('click',isSure);
    //     }
    // }
}