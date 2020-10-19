var EOP = (function($) {
	var mainD, parentWidth, parentHeight;
	var N_input, M_input;
	var stepP, nextB, prevB, outputC;
	var currentSTEP = 1, algSTEP = 0, evoSTEP = 0, algMAX = 6, dX = 0;
	var evoRESULT = "Результат не определен.";
	var N = 0, M = 0;
	var limM = [], compM = [], cM = [], wM = [], wLIM = 1, xM = [];
	var wF_i = -1, limA_i = -1, xi_i = -1, xiIsxd = false, resultW = 0;
	var	wNewM = [], limFM = [], limNewM = [], compNewM = [], cNewM = [];
	var dXarray = [], nAarray = [], XIarray = [], replacedXM = [];
	var updateConst = function()
	{
		parentWidth = window.innerWidth;
		parentHeight = window.innerHeight;
	}
	var init = function()
	{
		updateConst();
		mainD = document.getElementById('mainD');
		stepP = document.getElementById('stepP');
		controlsD = document.getElementById('controlsD');
		prevB = document.getElementById('prevB');
		nextB = document.getElementById('nextB');
		prevB.value = "Назад";
		nextB.value = "Далее";
		prevB.addEventListener("click", prevClick);
		nextB.addEventListener("click", nextClick);
		openStep1();
		prevB.disabled = true;
    }
	var prevClick = function()
	{
		if(currentSTEP == 2)
		{
			closeStep2();
			openStep1();
			N_input.value = N;
			M_input.value = M;
			currentSTEP = 1;
		}
		else if(currentSTEP == 3)
		{
			closeStep3();
			openStep2();
			for(var i=0; i<M; i++)
			{
				for(var j=0; j<N; j++)
				{
					var matrixel = document.getElementById("m_" + i + "_" + j);
					matrixel.value = limM[i+M][j];
				}
				var comparator = document.getElementById("comp" + i);
				comparator.value = compM[i+M];
				var c = document.getElementById("c" + i);
				c.value = cM[i+M];
			}
			currentSTEP = 2;
		}
		else if(currentSTEP == 4)
		{
			closeStep4();
			openStep3();
			for(var i=0; i<N; i++)
			{
				var wI = document.getElementById("w_" + i);
				wI.value = wM[i];
			}
			var comparator = document.getElementById("MaxMin");
			comparator.value = wLIM;
			currentSTEP = 3;
		}
		else if(currentSTEP == 5)
		{
			closeStep5();
			openStep4();
			currentSTEP = 4;
		}
		updateControls();
	}
	var nextClick = function()
	{
		if(currentSTEP == 1)
		{
			var tN = parseFloat(N_input.value);
			var tM = parseFloat(M_input.value);
			if((tN >= 2 && tN <= 10) && (tM >= 2 && tM <= 10) && tN%1 == 0 && tM%1 == 0)
			{
				N = tN;
				M = tM;
				replacedXM = [N];
				for(var i=0; i<N; i++)
				{
					replacedXM[i] = false;
				}
				closeStep1();
				openStep2();
				currentSTEP = 2;
				updateControls();
			}
			else alert("Указаны неверные данные. " + 
					   "Поля должны содержать целые числа от 2 до 10. " +
					   "Ваши данные после преобразования: N = " + 
					   tN + " и M = " + tM + " .");
		}
		else if(currentSTEP == 2)
		{
			//Проверка правильности ввода
			var checker = 0;
			var errors = 0;
			for(var i=0; i<M; i++)
			{
				var zeros = 0;
				for(var j=0; j<N; j++)
				{
					var matrixel = document.getElementById("m_" + i + "_" + j);
					var val = parseFloat(matrixel.value);
					if(val >= -1000 && val <= 1000)
					{
						checker += 1;
					}
					if(val == 0) zeros += 1;
				}
				var c = document.getElementById("c" + i);
				var val = parseFloat(c.value);
				if(val >= -10000 && val <= 10000)
				{
					checker += 1;
				}
				if(zeros == N)
				{
					alert("Для ограничения в строке " + (i+1) + " не указано ни одного коэффициента. Если этого ограничения не должно быть, необходимо вернуться на предыдущий шаг и уменьшить величину M.");
					errors += 1;
				}
			}
			if(checker == (N+1)*M)
			{
				if(errors == 0)
				{
					//Запись данных в матрицы (массивы)
					limM = [M*2];
					compM = [M*2];
					cM = [M*2];
					for(var i=0; i<M*2; i++)
					{
						limM[i] = [N]; //Пустой подмассив
						if(i < M) //Запись ограничений вида xj <= 0
						{
							for(var j=0; j<N; j++)
							{
								if(j == i) limM[i][j] = 1;
								else limM[i][j] = 0;
							}
							compM[i] = 3;
							cM[i] = 0;
						}
						else //Запись ограничений вида sum[aij*xij] <= ci;
						{
							for(var j=0; j<N; j++)
							{
								var matrixel = document.getElementById("m_" + (i-M) + "_" + j);
								limM[i][j] = parseFloat(matrixel.value);
							}
							var comparator = document.getElementById("comp" + (i-M));
							compM[i] = parseFloat(comparator.value);
							var c = document.getElementById("c" + (i-M));
							cM[i] = parseFloat(c.value);
						}
					}
					closeStep2();
					openStep3();
					currentSTEP = 3;
					updateControls();
				}
			}
			else alert("Имеются ошибки в записи коэффициентов ограничений. Принимаются числа в диапазоне от -1000 до 1000 включительно (для коэффициентов при x) и в диапазоне от -10000 до 10000 (для правых частей ограничений).");
		}
		else if(currentSTEP == 3)
		{
			//Проверка правильности ввода
			var checker = 0;
			var errors = 0;
			var zeros = 0;
			for(var i=0; i<N; i++)
			{
				var w = document.getElementById("w_" + i);
				var val = parseFloat(w.value);
				if(val >= -100 && val <= 100)
				{
					checker += 1;
				}
				if(val == 0) zeros += 1;
			}
			if(zeros == N)
			{
				errors += 1;
			}
			if(checker == N && errors == 0)
			{
				//Запись данных в матрицы (массивы)
				wM = [N];
				wLIM = 1;
				for(var i=0; i<N; i++)
				{
					var w = document.getElementById("w_" + i);
					wM[i] = parseFloat(w.value);
				}
				var comparator = document.getElementById("MaxMin");
				wLIM = comparator.value;
				closeStep3();
				openStep4();
				currentSTEP = 4;
				updateControls();
			}
			else alert("Имеются ошибки в записи коэффициентов целевой функции. Принимаются числа в диапазоне от -100 до 100 включительно.");
		
		}
		else if(currentSTEP == 4)
		{
			closeStep4();
			openStep5();
			currentSTEP = 5;
			updateControls();
		}
		updateControls();
	}	
	var updateControls = function()
	{
		if(currentSTEP == 1)
		{
			prevB.disabled = true;
			nextB.disabled = false;
		}
		else if(currentSTEP == 2 || currentSTEP == 3 || currentSTEP == 4)
		{
			prevB.disabled = false;
			nextB.disabled = false;
		}
	}	
	var openStep1 = function()
	{
		stepP.innerHTML = "<strong>ШАГ 1:</strong> Количество переменных и ограничений";
		var N_label = document.createElement("label");
		var M_label = document.createElement("label");
		var N_p = document.createElement("p");
		var M_p = document.createElement("p");
		N_input = document.createElement("input");
		M_input = document.createElement("input");
		N_label.id = "N_label";
		M_label.id = "M_label";
		N_p.className = "inP";
		N_p.textContent = "Введите N (число переменных, от 2 до 10):    ";
		M_p.className = "inP";
		M_p.textContent = "Введите M (число ограничений, от 2 до 10):  ";
		N_input.type = "number";
		N_input.id = "N_input";
		N_input.min = 2;
		N_input.max = 10;
		N_input.placeholder = "N";
		N_input.pattern = "[0-9]{1,2}";
		M_input.type = "number";
		M_input.id = "N_input";
		M_input.min = 2;
		M_input.max = 10;
		M_input.placeholder = "M";
		M_input.pattern = "[0-9]{1,2}";
		mainD.appendChild(N_label);
		mainD.appendChild(M_label);
		N_label.appendChild(N_p);
		N_label.appendChild(N_input);
		M_label.appendChild(M_p);
		M_label.appendChild(M_input);
		updateControls();
	}
	var closeStep1 = function()
	{
		var N_label = document.getElementById('N_label');
		var M_label = document.getElementById('M_label');
		N_label.parentNode.removeChild(N_label);
		M_label.parentNode.removeChild(M_label);
	}
	var openStep2 = function()
	{
		stepP.innerHTML = "<strong>ШАГ 2:</strong> Ввод ограничений";
		var descLabel = document.createElement("label");
		descLabel.id = "descLabel";
		descLabel.className = "matrix";
		for(var i=0; i<N+2; i++) //Подписи к ограничениям
		{
			var descP = document.createElement("p");
			descP.id = "row" + i;
			if(i < N)descP.innerHTML = "x<sub><small>"+(i+1)+"</small></sub>";
			descP.className = "descP";
			if(i >= N) descP.className = "descP_h";
			descLabel.appendChild(descP);
		}
		mainD.appendChild(descLabel);
		for(var i=0; i<M; i++) //Ограничения
		{
			var matrixLabel = document.createElement("label");
			matrixLabel.id = "line" + i;
			matrixLabel.className = "matrix";
			//Поля для ввода коэффициентов из левых частей ограничений
			for(var j=0; j<N; j++)
			{
				var matrixel = document.createElement("input");
				matrixel.id = "m_" + i + "_" + j;
				matrixel.className = "matrixEL";
				matrixel.value = 0;
				matrixLabel.appendChild(matrixel);
			}
			//Поля для указания операторов сравнения ограничений
			var comparator = document.createElement("select");
			comparator.id = "comp" + i;
			comparator.className = "comp";
			var opt1 = document.createElement("option");
			opt1.appendChild(document.createTextNode(">="));
			opt1.value = "1";
			comparator.appendChild(opt1);
			var opt2 = document.createElement("option");
			opt2.appendChild(document.createTextNode("="));
			opt2.value = "2";
			comparator.appendChild(opt2);
			var opt3 = document.createElement("option");
			opt3.appendChild(document.createTextNode("<="));
			opt3.value = "3";
			opt3.selected = "selected";
			comparator.appendChild(opt3);
			matrixLabel.appendChild(comparator);
			//Поля для ввода правых частей ограничений
			var c = document.createElement("input");
			c.id = "c" + i;
			c.className = "matrixEL";
			c.value = 0;
			matrixLabel.appendChild(c);
			mainD.appendChild(matrixLabel);
		}
	}
	var closeStep2 = function()
	{
		var descLabel = document.getElementById('descLabel');
		descLabel.parentNode.removeChild(descLabel);
		for(var i=0; i<M; i++)
		{
			var matrixLabel = document.getElementById("line" + i);
			matrixLabel.parentNode.removeChild(matrixLabel);
		}
	}
	var openStep3 = function()
	{
		stepP.innerHTML = "<strong>ШАГ 3:</strong> Целевая функция";
		var w = document.createElement("label");
		w.id = "wLabel";
		w.className = "matrix";
		for(var i=0; i<N; i++)
		{
			var wI = document.createElement("input");
			wI.id = "w_" + i;
			wI.className = "matrixEL_w";
			wI.value = 0;
			w.appendChild(wI);
			var wP = document.createElement("p");
			wP.id = "p_" + i;
			if(i<N-1)
			{
				wP.innerHTML = "x<sub><small>"+(i+1)+"</small></sub>  +";
				wP.className = "wP";
			}
			else 
			{
				wP.innerHTML = "x<sub><small>"+(i+1)+"</small></sub>  &#10230;";
				wP.className = "wP_last";
			}
			w.appendChild(wP);
		}
		var comparator = document.createElement("select");
		comparator.id = "MaxMin";
		comparator.className = "comp";
		var opt1 = document.createElement("option");
		opt1.appendChild(document.createTextNode("max"));
		opt1.value = "1";
		comparator.appendChild(opt1);
		var opt2 = document.createElement("option");
		opt2.appendChild(document.createTextNode("min"));
		opt2.value = "2";
		comparator.appendChild(opt2);
		w.appendChild(comparator);
		mainD.appendChild(w);
	}
	var closeStep3 = function()
	{
		var w = document.getElementById('wLabel');
		w.parentNode.removeChild(w);
	}
	var openStep4 = function()
	{
		stepP.innerHTML = "<strong>ШАГ 4:</strong> Проверка введенных данных. Убедитесь, что представленные ниже сведения соответствуют введенным вами данным.";
		for(var i=0; i<M*2+3; i++)
		{
			var sP = document.createElement("p");
			sP.id = "stroke" + i;
			sP.className = "preStroke";
			if(i == 0) sP.innerHTML = "Ограничения:";
			if(i > 0 && i <= M*2) sP.innerHTML = limitsToHTML(limM, compM, cM, -1, i-1);
			if(i == M*2 + 1) sP.innerHTML = "Целевая функция:";
			if(i == M*2 + 2) sP.innerHTML = wToHTML(wM, wLIM, -1);
			mainD.appendChild(sP);
		}
	}
	var closeStep4 = function()
	{
		for(var i=0; i<M*2+3; i++)
		{
			var sP = document.getElementById("stroke" + i);
			sP.parentNode.removeChild(sP);
		}
	}
    var openStep5 = function()
	{
		stepP.innerHTML = "<strong>ШАГ 5:</strong> Выполнение рассчетов. Для запуска процедуры нажмите на кнопку ниже.";
		var startB = document.createElement("input");
		startB.type = "button";
		startB.id = "startButton";
		startB.value = "Найти решение";
		startB.addEventListener("click", beginEvolution);
		outputC = document.createElement("div");
		outputC.id = "consoleC";
		mainD.appendChild(startB);
		mainD.appendChild(outputC);
	}
	var closeStep5 = function()
	{
		var startB = document.getElementById("startButton");
		startB.parentNode.removeChild(startB);
		outputC.parentNode.removeChild(outputC);
		outputC.innerHTML = "";
	}
	var beginEvolution = function()
	{
		var startB = document.getElementById("startButton");
		startB.disabled = true;
		prevB.disabled = true;
		nextB.disabled = true;
		outputC.innerHTML = "";
		wF_i = -1;
		limA_i = -1;
		xi_i = -1;
		xiIsxd = false;
		resultW = 0;
		algSTEP = 0;
		evoSTEP = 0;
		dX = 0;
		while(algSTEP <= algMAX)
		{
			//Задание начальной точки
			if(algSTEP == 0)
			{
				outputC.innerHTML += "Запущен процесс поиска решения.<br>";
				xM = [N];
				outputC.innerHTML += "Задание начальной точки: X[] = { "
				for(var i=0; i<N; i++)
				{
					xM[i] = 0;
					if(i<N-1) outputC.innerHTML += xM[i].toString() + ", ";
					else outputC.innerHTML += xM[i].toString() + " };<br>";
				}
				algSTEP++;
				outputC.scrollTop = outputC.scrollHeight;
			}
			//Поиск отрицательного коэффициента в целевой функции
			else if(algSTEP == 1)
			{
				for(var i=0; i<N; i++)
				{
					if(wM[i] < 0)
					{
						outputC.innerHTML += "Найден отрицательный коэффициент (при x<sub>"+(i+1)+"</sub>).<br>";
						wF_i = i;
						break;
					}
				}
				if(wF_i == -1)
				{
					evoRESULT = "Не найдено ни одного отрицательного коэффициента. Вероятно, имеющееся решение уже является оптимальным.";
					algSTEP = algMAX;
				}
				else algSTEP++;
				outputC.scrollTop = outputC.scrollHeight;
			}
			//Генерация новых коэффициэнтов для целевой функции
			else if(algSTEP == 2)
			{
				wNewM = [N];
				outputC.innerHTML += "Генерация новых коэффициентов для ЦФ...<br>"
				for(var i=0; i<N; i++)
				{
					//wNewM[i] = Math.random() + 1;
					wNewM[i] = 1;
					outputC.innerHTML += "b<sub>" + (i+1) + "</sub> = " + wNewM[i] + "<br>";
				}
				outputC.innerHTML += "Целевая функция принимает вид:<br>"
				outputC.innerHTML += wToHTML(wNewM, wLIM, wF_i) + "<br>";
				//Вычисление коэффициентов для фиктивного ограничения
				limFM = [N];
				outputC.innerHTML += "Вычисление новых коэффициентов для замены x<sub>i*</sub> на x<sub>d</sub>...<br>";
				for(var i=0; i<N; i++)
				{
					if(i != wF_i) limFM[i] = (wM[i] - wNewM[i])/wNewM[wF_i]; //hi
					else limFM[i] = wM[i]/wNewM[i]; //hi*
				}
				//Вычисление новых коэффициентов для ограничений
				outputC.innerHTML += "Изменение ограничений с учетом фиктивной переменной...<br>";
				limNewM = [M*2];
				outputC.innerHTML += "Новые ограничения:<br>";
				for(var i=0; i<M*2; i++)
				{
					limNewM[i] = [N];
					if(limM[i][wF_i] != 0) //Ограничение, в котором есть xi*
					{
						for(var j=0; j<N; j++)
						{
							if(j == wF_i) limNewM[i][j] = limM[i][j]/limFM[j];
							else limNewM[i][j] = limM[i][j] - limM[i][wF_i]*limFM[j]/limFM[wF_i];
						}
					}
					else //Неизмененные ограничения
					{
						for(var j=0; j<N; j++)
						{
							limNewM[i][j] = limM[i][j];
						}
					}
					outputC.innerHTML += limitsToHTML(limNewM, compM, cM, wF_i, i) + "<br>";
				}
				algSTEP++;
				outputC.scrollTop = outputC.scrollHeight;
			}
			//Начало эволюции параметра
			else if(algSTEP == 3)
			{
				//Подготовка
				evoSTEP += 1;
				//Сохранение текущих значений правой части ограничений
				if(evoSTEP == 1)
				{
					cNewM = [M*2];
					for(var i=0; i<M*2; i++)
					{
						compNewM[i] = compM[i];
						cNewM[i] = cM[i];
					}
				}
				if(evoSTEP == 1) outputC.innerHTML += "Начало эволюции... Итерация " + evoSTEP + "<br>";
				else if(evoSTEP > 1) outputC.innerHTML += "Итерация " + evoSTEP + "<br>";
				//Поиск вершины для эволюции
				outputC.innerHTML += "Поиск вершины для перехода...<br>";
				dXarray = []; //массив c[i]/a[id]
				nAarray = []; //массив a[id]
				for(var i=0; i<M*2; i++)
				{
					nAarray.push(limNewM[i][wF_i]);
					dXarray.push(cNewM[i]/limNewM[i][wF_i]);
				}
				//Поиск минимального соотношения с сохранением индекса активного ограничения
				dX = Number.MAX_VALUE; //Максимально возможное большое число в JS
				for(var i=0; i<M*2; i++)
				{
					if(nAarray[i] > 0)
					{
						if(dXarray[i] < dX)
						{
							dX = dXarray[i];
							limA_i = i; //Запоминаем номер активного ограничения
						}
					}
				}
				outputC.innerHTML += "ОТЛАДОЧНОЕ СООБЩЕНИЕ: limA_i = " + limA_i + "<br>";
				if(Math.max.apply(null, nAarray) <= 0 || limA_i == -1)
				{
					evoRESULT = "Решением задачи является бесконечно большое значение.";
					algSTEP = algMAX;
				}
				else 
				{
					outputC.innerHTML += "Найдено активное ограничение: " + (limA_i+1) +"<br>";
					outputC.innerHTML += "Величина приращения: " + Math.round(dX*1000)/1000 + "<br>";
					xM[wF_i] += dX;
					resultW += dX*wNewM[wF_i];
					outputC.innerHTML += "Результирующее значение функции для текущей итерации: " + resultW + "<br>";
					outputC.innerHTML += "Новая позиция: { "
					for(var i=0; i<N; i++)
					{
						if(i<N-1) outputC.innerHTML += Math.round(xM[i]*1000)/1000 + ", ";
						else outputC.innerHTML += Math.round(xM[i]*1000)/1000 + " };<br>";
					}
					algSTEP++;
					outputC.scrollTop = outputC.scrollHeight;
				}
			}
			//Сдвиг точки начала координат с учетом xф
			else if(algSTEP == 4) 
			{
				outputC.innerHTML += "Замена переменной x<sub>ф</sub> на x<sub>ф</sub> + &#916;x<sub>ф</sub>...<br>";
				for(var i=0; i<M*2; i++) //Перебор ограничений
				{
					if(limNewM[i][wF_i] != 0) //Ограничение, в котором есть xi*
					{
						
						cNewM[i] = cNewM[i] - dX*limNewM[i][wF_i]; //Изменение правой части ограничения
					}
				}
				outputC.innerHTML += "Новые ограничения:<br>";
				for(var i=0; i<M*2; i++)
				{
					outputC.innerHTML += limitsToHTML(limNewM, compNewM, cNewM, wF_i, i) + "<br>";
				}
				algSTEP++;
				outputC.scrollTop = outputC.scrollHeight;
			}
			//Поиск и замена переменной
			else if(algSTEP == 5)
			{
				outputC.innerHTML += "Выбор переменной для замены (в активном ограничении)...<br>";
				XIarray = []; //Массив с bi/aj*i
				nAarray = []; //Массив с aj*i
				for(var i=0; i<N; i++)
				{
					nAarray.push(limNewM[limA_i][i]);
					XIarray.push(wNewM[i]/limNewM[limA_i][i]);
				}
				var ba = Number.MAX_VALUE; //Максимально возможное большое число в JS
				for(var i=0; i<N; i++)
				{
					if(nAarray[i] > 0)
					{
						if(XIarray[i] < ba)
						{
							ba = XIarray[i];
							xi_i = i; //Запоминаем номер заменяемой переменной xi*
						}
					}
				}
				outputC.innerHTML += "ОТЛАДОЧНОЕ СООБЩЕНИЕ: xi_i = " + xi_i + "<br>";
				if(xi_i >= 0) replacedXM[xi_i] = true;
				if(Math.max.apply(null, nAarray) <= 0 || xi_i == -1)
				{
					evoRESULT = "Не найдена переменная x<sub>i*</sub> для замены.<br>";
					algSTEP = algMAX;
				}
				else 
				{	
					if(xi_i == wF_i)
					{
						xiIsxd = true;
						outputC.innerHTML += "Найдена переменная x<sub>i*</sub> для замены. Это x<sub>d</sub>.<br>";
					}
					else outputC.innerHTML += "Найдена переменная x<sub>i*</sub> для замены. Это x<sub>" + (xi_i+1) + "</sub>.<br>";
					//Замена активного ограничения
					if(xi_i == wF_i) outputC.innerHTML += "Замена переменной x<sub>d</sub> в ограничениях и ЦФ...<br>";
					else outputC.innerHTML += "Замена переменной x<sub>" + (xi_i+1) + "</sub> в ограничениях и ЦФ...<br>";
					//Пересчет коэффициентов целевой функции
					for(var i=0; i<N; i++)
					{
						if(i == xi_i) wNewM[i] = wNewM[i]/limNewM[limA_i][xi_i];
						else if(i == wF_i) wNewM[i] = wNewM[i] - wNewM[xi_i]*limNewM[limA_i][wF_i]/limNewM[limA_i][xi_i];
						else wNewM[i] = wNewM[i] - wNewM[xi_i]*limNewM[limA_i][i]/limNewM[limA_i][xi_i];
					}
					//Пересчет ограничений
					for(var i=0; i<M*2; i++)
					{
						if(limNewM[i][xi_i] != 0 && i != limA_i) //Ограничение, в котором есть xi* и оно не является активным
						{
							outputC.innerHTML += "Обновление ограничения " + (i+1) + "<br>";
							for(var j=0; j<N; j++) //Обновление коэффициентов при невыбранных переменных
							{
								if(j != xi_i) limNewM[i][j] = limNewM[i][j]-limNewM[i][xi_i]*limNewM[limA_i][j]/limNewM[limA_i][xi_i];
							}
							for(var j=0; j<N; j++) //Обновление коэффициента при выбранной переменной
							{
								if(j == xi_i) limNewM[i][j] = limNewM[i][j]/limNewM[limA_i][xi_i];
							}
						}
					}
					for(var i=0; i<M*2; i++)
					{
						if(limNewM[i][xi_i] != 0 && i == limA_i) //Ограничение, в котором есть xi* и оно активное
						{
							outputC.innerHTML += "Обновление ограничения " + (i+1) + "<br>";
							for(var j=0; j<N; j++) //Обновление коэффициентов при невыбранных переменных
							{
								if(j == xi_i) limNewM[i][j] = 1;
								else limNewM[i][j] = 0;
							}
							compNewM[i] = 3;
							cNewM[i] = 0;
						}
					}
					outputC.innerHTML += "Новые ограничения:<br>";
					for(var i=0; i<M*2; i++)
					{
						outputC.innerHTML += limitsToHTML(limNewM, compNewM, cNewM, wF_i, i) + "<br>";
					}
					outputC.innerHTML += "Целевая функция после изменений:<br>";
					outputC.innerHTML += wToHTML(wNewM, wLIM, wF_i) + "<br>";
					if(xiIsxd)
					{
						evoRESULT = "Решение найдено.<br>";
						evoRESULT += "Конечное значение целевой функции: " + resultW + "<br>";
						algSTEP = algMAX;
					}
					else
					{
						limA_i = -1;
						xi_i = -1;
						algSTEP = 3;
					}
				}
				outputC.scrollTop = outputC.scrollHeight;
			}
			//Конец
			else if(algSTEP == algMAX)
			{
				outputC.innerHTML += "<br>Процедура эволюции завершена.<br><br>РЕЗУЛЬТАТ:<br>";
				outputC.innerHTML += evoRESULT;
				startB.disabled = false;
				prevB.disabled = false;
				nextB.disabled = false;
				outputC.scrollTop = outputC.scrollHeight;
				break;
			}
		}
	}
	var mainDRAW = function()
	{
		
	}
	var limitsToHTML = function(dataM, data2M, data3M, F_i, num)
	{
		var stroke = "";
		var first = true;
		for(var i=0; i<N; i++)
		{
			if(Math.abs(dataM[num][i]) != 0)
			{
				if(Math.sign(dataM[num][i]) == -1) stroke += " - ";
				else if(Math.sign(dataM[num][i]) == 1 && !first) stroke += " + ";
			}
			if(Math.abs(dataM[num][i]) != 0 && Math.abs(dataM[num][i]) != 1)
			{
				stroke += Math.abs(dataM[num][i]);
			}
			if(Math.abs(dataM[num][i]) != 0)
			{
				stroke += "x";
				if(replacedXM[i]) stroke += "'";
				if(F_i >= 0 && i == F_i) stroke += "<sub>d</sub>";
				else stroke += "<sub>" + (i+1) + "</sub>";
				first = false;
			}
		}
		if(data2M[num] == 1) stroke += " &#8805 ";
		if(data2M[num] == 2) stroke += " = ";
		if(data2M[num] == 3) stroke += " &#8804 ";
		stroke += (Math.round(data3M[num]*1000)/1000).toString();
		return stroke;
	}
	var wToHTML = function(dataM, lim, F_i)
	{
		var stroke = "";
		var first = true;
		for(var i=0; i<N; i++)
		{
			if(Math.sign(dataM[i]) == -1) stroke += " - ";
			else if(Math.sign(dataM[i]) == 1  && !first) stroke += " + ";
			if(Math.abs(dataM[i]) != 0 && Math.abs(dataM[i]) != 1)
			{
				stroke += (Math.round(Math.abs(dataM[i])*1000)/1000).toString();
			}
			if(Math.abs(dataM[i]) != 0) 
			{
				stroke += "x";
				if(replacedXM[i]) stroke += "'";
				if(F_i >= 0 && i == F_i) stroke += "<sub>d</sub>";
				else stroke += "<sub>" + (i+1) + "</sub>";
				first = false;
			}
		}
		stroke += " &#10230 ";
		if(lim == 1) stroke += "max";
		else stroke += "min";
		return stroke;
	}
	$(document).ready(function()
	{
		init();
    });
})(jQuery)