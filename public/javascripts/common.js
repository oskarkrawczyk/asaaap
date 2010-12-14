(function(){

	Element.implement({
		moveTo: function(element){
			var clone = this.clone();
			clone.inject(element, 'top');
			clone.highlight();
			this.destroy();
		},
		
		highlight: function(start, end){
			if (!end){
				end = this.retrieve('highlight:original', this.getStyle('background-color'));
				end = (end == 'transparent') ? '#F7F9F8' : end;
			}
			var tween = this.get('tween');
			tween.start('background-color', start || '#ffff88', end).chain(function(){
				this.setStyle('background-color', this.retrieve('highlight:original'));
				tween.callChain();
			}.bind(this));
			return this;
		}
	});
    

	var AsapList = this.AsapList = new Class({

		todo: {},

		initialize: function(presetList){
			self = this;
			this.todo = presetList;
			this.template = '<li data-id="{id}"><input type="checkbox" /> <span>{title}</span> <a href="#">Delete</a></li>';
			this.activeTemplate = '';
			this.doneTemplate = '';
			this.element = {
				activeList: document.id('active-todo'),
				doneList: document.id('done-todo'),
				lists: document.getElements('ul'),
				omnibox: document.id('omni-box'),
				agent: document.id('agent')
			};

			this.setup();
		},

		setup: function(){
			this.hideAgent(true);
			this.populateLists();
			this.moveFromList();
			this.addItem();
		},
		
		populateLists: function(){
			
			// populate the active items
			this.todo.active.each(function(item) {
				this.activeTemplate += this.template.substitute(item);
			}, this);
			this.element.activeList.adopt(Elements.from(this.activeTemplate));

			// populate the inactive items
			this.todo.done.each(function(item) {
				this.doneTemplate += this.template.substitute(item);
			}, this);
			this.element.doneList.adopt(Elements.from(this.doneTemplate));
			
			// make sure the checkboxes are checked
			this.element.doneList.getElements('input').each(function(field){
				field.checked = true;
			});
		},

		moveFromList: function(){
			this.element.lists.addEvents({
				'change:relay(input)': this.moveItem.bind(this),
				'click:relay(a)': this.deleteItem.bind(this)
			});
		},

		addItem: function(){
			this.element.omnibox.addEvents({
				submit: this.submitItem.bind(this)
			});
		},
		
		submitItem: function(event){
			event.stop();
			var itemFrom = event.target.getElement('input[type=text]');
			var itemData = {
				title: itemFrom.get('value'),
				id: String.uniqueID()
			};
			if (itemFrom.get('value').trim() !== ''){
				var item = this.template.substitute(itemData);
				Elements.from(item).inject(this.element.activeList, 'top').highlight();
				this.todo.active = [itemData].append(this.todo.active);
				itemFrom.set('value', '');
			}
			this.sendLists();
		},

		moveItem: function(event){
			event.target.getParent().moveTo(event.target.checked ? this.element.doneList : this.element.activeList);
			this.todo.done = this.updateList(this.element.doneList);
			this.todo.active = this.updateList(this.element.activeList);
			this.sendLists();
		},
		
		showAgent: function(){
			this.element.agent.tween('top', 0);
		},
		
		hideAgent: function(instant){
			this.element.agent[(instant ? 'setStyle' : 'tween')]('top', -80);
		},
		
		updateList: function(list){
			var updatedList = [];
			list.getElements('li').each(function(item){
				updatedList.include({
					id: item.get('data-id'),
					title: item.getElement('span').get('html')
				});
			});
			return updatedList;
		},

		deleteItem: function(event){
			event.stop();
			var list = event.target.getPrevious('input').checked ? this.todo.done : this.todo.active;
			var itemCont = event.target.getParent();
			Object.each(list, function(item){
				if (item.id == itemCont.get('data-id')){
					itemCont.destroy();
					list = list.erase(item);
					this.sendLists('delete', item.id);
				}
			}.bind(this));
		},
		
		sendLists: function(mode, itemId){
			console.log(mode, itemId);
			
			new Request.JSON({
				url: '/',
				method: 'post',
				data: Object.toQueryString(this.todo),
				onSuccess: this.hideAgent.bind(this),
				onRequest: this.showAgent.bind(this)
			}).send();
		}

	});

})();
