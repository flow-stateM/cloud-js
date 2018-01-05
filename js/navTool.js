//工具栏事件委托
toolBtns.addEventListener('click',function(e){
    if(toolBtns.classList.contains('notuse'))return ;
    var target = e.target;
    //重命名
    if(target.classList.contains('rename')||target.classList.contains('renameIcon')){
        if(checkedBuffer.length >1){
            return infoShow('3','最多选择一个文件');
        }
        if(checkedBuffer.length ===0){
            return infoShow('3','必须选择一个文件');
        }
        var setNewId = getCheckedFileFromBuffer()[0].newId;
        var setItem = getCheckedFileFromBuffer()[0].item.querySelector('.nowName');
        reName(setItem,setNewId);
    }
    //删除
    if(target.classList.contains('delete')||target.classList.contains('deleteIcon')){
        if(checkedBuffer.length===0){
            return infoShow(3,'请至少选择一个文件进行删除');
        }
        wrap.classList.add('delete');
        deleteWrap.classList.add('active');
        deleteWrap.appendChild(createMaskFn(`确认删除这${checkedBuffer.length}个文件？`));
        deleteWrap.addEventListener('click',isSure);
        function isSure(e){
            var target = e.target
            if(target.classList.contains('close')||target.classList.contains('cancelBtn')){
                wrap.classList.remove('delete');
                deleteWrap.classList.remove('active');
                deleteWrap.removeEventListener('click',isSure);
                return ;
            }
            //如果确定删除就执行
            if(target.classList.contains('sureBtn')){
                var len = checkedBuffer.length;
                for(var i=0;i<len;i++){
                    let newId = getCheckedFileFromBuffer()[0].newId;
                    // console.log(newId);
                    deleteItemById(data,getCheckedFileFromBuffer()[0].newId);
                    delete checkedBuffer[newId];
                    checkedBuffer.length--;
                };
                createFileContent(currentListId);
                wrap.classList.remove('delete');
                deleteWrap.classList.remove('active');
                deleteWrap.removeEventListener('click',isSure);
            }
        }
    }
    //新建文件夹
    if(target.classList.contains('create')||target.classList.contains('createIcon')){
        //先创建一条新的数据 然后根据这条数据创建一个节点 添加到最前面 取消其他选择 选中这个文件

        fileContent.classList.remove('none');
        const newFileData = {
            id:Date.now(),
            name:'',
            pId:currentListId
        };
        const newFile = createItemFile(newFileData);
        fileContent.insertBefore(newFile,fileContent.firstElementChild);
        checkedAll.classList.remove('checked');
        isAllCheckedFn(false);
        checkedFn(newFile.firstElementChild);
        //生成并选中之后进行重命名
        var newNowName = newFile.querySelector('.nowName');
        reName(newNowName,newFileData.id,
        function(newName){
            newFileData.name = newName;
            addOneData(data,newFileData);
            infoShow(2,'新建文件夹成功');
            
        },
        function(){//设置不成功的情况下 删除节点 清空checkedBuffer 提示取消新建文件夹
            createFileContent(currentListId);
            infoShow(1,'取消新建文件夹');
            toolBtns.classList.remove('notuse');
        }
        )
    }
    //移动到
    if(target.classList.contains('move')||target.classList.contains('moveIcon')){
        if(checkedBuffer.length===0) return infoShow(3,'请至少选择一位佳丽进行移动');
        moveToWrap.classList.add('active');
        wrap.classList.add('delete');
        var moveToContent = moveToWrap.querySelector('.moveToContent');
        moveToContent.innerHTML = createMoveToFn(data);
        var moveToBorder =document.querySelector('.moveToBorder');
        moveToBorder.style.left = `${(moveToBorder.parentNode.clientWidth-moveToBorder.offsetWidth)/2 +'px'}`;
        moveToBorder.style.top = `${(moveToBorder.parentNode.clientHeight-moveToBorder.offsetHeight)/2 +'px'}`;
        //可以进行拖拽  由于用的是transition  所以需要延迟一点获取正确的定位父级的left和top值！
        setTimeout(function(){
            dragEle({
                downEle: moveToBorder.querySelector('.moveToHeader'),
                moveEle: moveToBorder
            });
        },210);
        //每个小图标点击的时候 里面的第一个子元素display:none
        //每个项目添加点击事件  文件夹图标添加点击事件   把选中的文件夹移动到指定的位置
        var allDivItems = moveToContent.querySelectorAll('div');
        var prevActive = moveTarget = currentListId;
        for(let i =0;i<allDivItems.length;i++){
            allDivItems[i].onclick = function(){
                allDivItems[prevActive].classList.remove('active');
                this.classList.add('active');
                prevActive = i;
                //用自定义获取id
                moveTarget = this.dataset.fileId*1;
            };
            allDivItems[i].firstElementChild.onclick = function(){
                //文件夹图标点击的时候他父级的父级的所有子元素  不包括他自己displaynone  他remove active
                var toBeNone = [...this.parentNode.parentNode.children].slice(1);
                //如果有其他子集 那么都displaynone
                if(toBeNone.length){
                    var ret = this.classList.toggle('active');
                    toBeNone.forEach(function(item) {
                        item.style.display = ret ? '' :'none' ;
                    });
                }
            }
        }
        //确定取消按钮
        var sure  =moveToWrap.querySelector('.sure');
        var cancel  =moveToWrap.querySelector('.cancel');
        var close = moveToWrap.querySelector('.close');
        sure.onclick = function () {
            var checkedItem = getCheckedFileFromBuffer(checkedBuffer);
            var isCanMoveNow = true;
            checkedItem.forEach(function(item){
                var nowId = item.newId;
                var ret = isCanMove(data,nowId,moveTarget);
                if(ret === 2){
                    isCanMoveNow = false;
                    infoShow(3,'不能移动到子集');
                    return closeFn();
                }
                if(ret === 3){
                    isCanMoveNow = false;
                    infoShow(3,'存在同名文件');
                    return closeFn();
                }
                if(ret === 4){
                    isCanMoveNow = false;
                    infoShow(3,'已经在当前目录');
                    return closeFn();

                }
            });
            if(isCanMoveNow){
                checkedItem.forEach(function(item) {
                    const {newId} = item;
                    moveToTarget(data, newId, moveTarget);
                    createFileContent(currentListId);
                    infoShow(2,'移动佳丽成功');
                    closeFn();
                });
            }

        };
        cancel.onclick = close.onclick = closeFn ;
        function closeFn (){
            moveToWrap.classList.remove('active');
            moveToWrap.querySelector('.moveToContent').innerHTML = '';
            wrap.classList.remove('delete');
            infoShow(3,'取消移动佳丽');
        };
        close.onmousedown = function(e){
            e.stopPropagation();
        }
    }
    //刷新
    if(target.classList.contains('reload')||target.classList.contains('reloadIcon')){
        animation({
            el:fileContent,
            attrs:{
                scale:0
            },
            duration:200,
            cb:function(){
                fileContent.innerHTML = '';
                createFileContent(currentListId);
                createBredCurmb(currentListId);
            }
        });
    }
    //可以继续做  选框 
});
//提示函数  第几个提示框 提示什么
function infoShow(num,text){
    if (infoShow.timer)return;
    if(text!==undefined){
        var infoBox = document.querySelector(`.warning${num}`); 
        infoBox.innerHTML =`<i class="warningIcon${num}"></i>${text}`
    }else{
        var infoBox = document.querySelector(`.warning${num}`); 
    }
        infoBox.classList.add('active');
        infoShow.timer = setTimeout(function(){
            infoBox.classList.remove('active');
            infoShow.timer = null;
        },3000);
}
//重命名 点击名字的时候可以重命名，选中点击重命名按钮也可以重命名   注意点击的是span 
//          span隐藏  input显示 自动聚焦 改span  失焦input隐藏 span显示  还要更改数据里的name
function reName(item,id,succseFn,failFn){
    toolBtns.classList.add('notuse');
    item.parentNode.classList.add('active');
    item.nextElementSibling.focus();
    item.nextElementSibling.value = item.innerHTML;
    item.nextElementSibling.addEventListener('blur',reNameDone);
    //禁用鼠标画框
    fileContent.onmousedown = null;
    //检测键盘  
    window.onkeyup = function (e){
        if(e.keyCode === 13){
          item.nextElementSibling.blur();
          //如果此时onkeyup为none了  会导致没命名成功的话就不能使用回车继续完成命名了
        }
      };
    function reNameDone(e){
        var target =e.target;
        var nowId = target.parentNode.parentNode.newId;
        var newName = target.value.trim();
        var oldName = target.previousElementSibling.innerHTML;
//注意一下不写名字的情况  名称和其他文件夹相同的情况  ！！！！！！
        if(!newName){
            // console.log(1);
            target.parentNode.classList.remove('active');
            target.removeEventListener('blur',reNameDone);
            fileContent.onmousedown = creatCircle;
            failFn&&failFn();
            toolBtns.classList.remove('notuse');
            return infoShow(3,'名字不能为空');
        };
        if(newName === oldName){
            target.parentNode.classList.remove('active');
            this.onblur = null;
            this.onkeyup = null;
            fileContent.onmousedown = creatCircle;
            toolBtns.classList.remove('notuse');
            failFn&&failFn();
            return;
        }
        if(!nameCanUse(data,currentListId,newName)){
            this.select();
            return infoShow(3,'名称冲突');
        };
        target.previousElementSibling.innerHTML = newName;
        target.parentNode.classList.remove('active');
        succseFn&&succseFn(newName);
        data[nowId].name = newName;
        target.removeEventListener('blur',reNameDone);
        infoShow(2,`恭喜此为佳丽命名为${newName}`);
        this.onkeyup = null;
        toolBtns.classList.remove('notuse');
        fileContent.onmousedown = creatCircle;
    }
}
