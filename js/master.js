// TODO:
/*    CURRENT:

    Allow several traces to be added to the graph
    
    Fill In Izhik Values for each Izkik type
        Add and allow default Current Injections for Izhik typs
    
    Add tooltips for variabes - explain what they do
    Tune and FIX the adex
   
    
*/

var currentTab = 1
var nSteps = 1000


// PARAMETER SETUP
// membrane constants



var lif_args = {
    tau: 0.002,
    R: 0.09,
    E: -70,
    theta: -30
	}
var iz_args = {
    C: 15,
    k: 1,
    vr: -80,
    vt: -30,
    vpeak: 40,
    a: 0.01,
    b: -20,
    c: 55,
    d: 91
}

var adex_args = {
    C: 281,     // nF
    gl: 30,     // nS
    el: -70.6,  // mV
    vt: -50.4,  // mV
    del: 2,     // mV
    tw: 144,    // ms
    a: 4,       // nS
    b: 0.0805 // nA
}

// On page load, run the simulation
//run_sim()


function run_sim(add) {
    sim = parseInt(currentTab);
    switch (sim) {
        case 1:
            lif_args.tau = (parseFloat(document.getElementById("Lif_Tau").value))
            lif_args.R = (parseFloat(document.getElementById("Lif_R").value))
            lif_args.E = (parseFloat(document.getElementById("Lif_E").value))
            lif_args.theta = (parseFloat(document.getElementById("Lif_Theta").value))

            sim_data = simulate(lif_args);
            break;
        case 2:
            iz_args.C = (parseFloat(document.getElementById("Iz_C").value))
            iz_args.k = (parseFloat(document.getElementById("Iz_k").value))
            iz_args.vr = (parseFloat(document.getElementById("Iz_vr").value))
            iz_args.vt = (parseFloat(document.getElementById("Iz_vt").value))
            iz_args.vpeak = (parseFloat(document.getElementById("Iz_vpeak").value))
            iz_args.a = (parseFloat(document.getElementById("Iz_a").value))
            iz_args.b = (parseFloat(document.getElementById("Iz_b").value))
            iz_args.c = (parseFloat(document.getElementById("Iz_c").value))
            iz_args.d = (parseFloat(document.getElementById("Iz_d").value))
            iz_args.tau = (parseFloat(document.getElementById("Iz_tau").value))
            sim_data = simulate_iz(iz_args);
            break;
        case 3:
            adex_args.C = (parseFloat(document.getElementById("Adex_C").value))
            adex_args.gl = (parseFloat(document.getElementById("Adex_gl").value))
            adex_args.el = (parseFloat(document.getElementById("Adex_el").value))
            adex_args.vt = (parseFloat(document.getElementById("Adex_vt").value))
            adex_args.del = (parseFloat(document.getElementById("Adex_del").value))
            adex_args.tw = (parseFloat(document.getElementById("Adex_tw").value))
            adex_args.a = (parseFloat(document.getElementById("Adex_a").value))
            adex_args.b = (parseFloat(document.getElementById("Adex_b").value))
			adex_args.vr = (parseFloat(document.getElementById("Adex_vr").value))
            sim_data = simulate_adex(adex_args);
            break;
        default:
            sim_data = simulate(lif_args);
    }
		console.log(sim_data)
    plot_results(sim_data);
}


// Simulate the neuron using the adaptive exponential integrate and fire model neuron.

function simulate_adex(adex_args) {
    // pass in as global setting with nSteps
    var dt = 0.1; //should be less than tau
    var C = adex_args.C
    var gl = adex_args.gl
    var el = adex_args.el
    var vt = adex_args.vt
    var del = adex_args.del
    var tw = adex_args.tw
    var a = adex_args.a
    var b = adex_args.b
    var vr = adex_args.vr

    var I = generateCurrent(3,dt);

    var dV = 0;
    var dw = 0;

    var V = [];
    V[0] = el;
    var w = [];
    w[0] = 0;

    for (var i = 0; i < nSteps; i++) {
        //v' = v + (k*(v-vr)*(v-vt) - u - I)/C;  
        //u' = u + (a*(b*(v-vr)-u);     
        dV = dt * (gl * (V[i] - el) + (gl * del * Math.exp((V[i] - vt) / del)) - w[i] + I[i]) / C
        dw = dt * ((a * (V[i] - el) - w[i]) / tw)

        V[i + 1] = V[i] + dV;
        w[i + 1] = w[i] + dw;
        if (V[i + 1] > 0) { // This seems like it should be parameterised
            V[i] = 0;
            w[i + 1] = w[i] + b;
            V[i + 1] = vr;
			console.log("Fired")
			console.log(V[i + 1])
			console.log(V[i])
			console.log(w[i + 1])
			console.log(w[i])
        }
    }


    var trace = [];
    var current = [];
	var time = [];
	var recovery= [];
	
	trace.push('Membrane Potential Vm ')
	current.push('Current Injection I')
	recovery.push('Recovery Variable')
	
	
for (var i = 0; i < nSteps; i++) {
        trace.push(V[i])
        current.push(I[i])
		time.push(i*dt)
		recovery.push(w[i])
    }	
    return {
        data_trace: trace,
        data_current: current,
		data_recovery:recovery,
		data_time: time
    }
}

// Simulate the neuron using the izhikevitch quadratic integrate and fire model neuron.

function simulate_iz(iz_args) {
    var dt = 0.1; //should be less than tau 
    var tau = iz_args.tau// pass in as global setting with nSteps
    //var nSteps = 2000;

    var C = iz_args.C //15;
    var k = iz_args.k //1;
    var vr = iz_args.vr //-80;
    var vt = iz_args.vt //-30;
    var vpeak = iz_args.vpeak //40;
    var a = iz_args.a // 0.01;
    var b = iz_args.b //-20;
    var c = iz_args.c // -55;
    var d = iz_args.d // 91;

    var I = generateCurrent(3,dt);

    var dV = 0;
    var du = 0;

    var V = [];
    V[0] = vr;
    var u = [];
    u[0] = 0;

    for (var i = 0; i < nSteps; i++) {
        //v' = v + (k*(v-vr)*(v-vt) - u - I)/C;  
        //u' = u + (a*(b*(v-vr)-u);     
        dV = dt * tau*(k * (V[i] - vr) * (V[i] - vt) - u[i] + I[i]) / C;
        du = dt * (a * (b * (V[i] - vr) - u[i]));
        V[i + 1] = V[i] + dV;
        u[i + 1] = u[i] + du;
        if (V[i + 1] > vt) {
            V[i] = vpeak;
            V[i + 1] = c;
            u[i + 1] = d;
        }
    }


    var trace = [];
    var current = [];
	var time = [];
	var recovery = [];
	
	trace.push('Membrane Potential Vm ')
	current.push('Current Injection I')
	recovery.push('Recovery Variable')

	for (var i = 0; i < nSteps; i++) {
        trace.push(V[i])
        current.push(I[i])
		time.push(i*dt)
		recovery.push(u[i])
    }
    return {
        data_trace: trace,
        data_current: current,
		data_time: time,
		data_recovery:recovery,
    }
}


		
		

// Generate the current injected into the neuron from the currents supplied

function generateCurrent(pattern,dt) {
    //var nSteps = 2000;
    var I = [];
    switch (pattern) {
        case 1:
            for (var i = 0; i < nSteps; i++) {
                I.push((5e-9 * Math.random()) - 1e-9);
            }
            break;
        case 2:
            for (var i = 0; i < nSteps; i++) {
                I.push(400);
            }
            break;


        default:
            // make an array of
            var current_means = document.getElementsByName("current_mean")
            var current_means_list = []

            var current_times = document.getElementsByName("current_time");
            var current_times_list = []
            var current_stds = document.getElementsByName("current_std")
            var current_stds_list = []

            for (var ls = 0; ls < current_means.length; ls++) {
                current_means_list.push(parseFloat(current_means[ls].value))
                current_times_list.push(parseInt(current_times[ls].value))
                current_stds_list.push(parseFloat(current_stds[ls].value))
            }


            var current_mean = 0;
            var current_std = 0;

            for (var i = 0; i < nSteps; i++) {
                var pos = current_times_list.indexOf(i)
                if (pos > -1) {
                    current_mean = current_means_list[pos]
                    current_std = current_stds_list[pos]
                }
                // Include support for normal distribution
                I.push(Math.randomGaussian(current_mean, current_std));
            }
    }

    return I
}

Math.randomGaussian = function (mean, standardDeviation) {

    //mean = defaultTo(mean, 0.0);
    //standardDeviation = defaultTo(standardDeviation, 1.0);

    if (Math.randomGaussian.nextGaussian !== undefined) {
        var nextGaussian = Math.randomGaussian.nextGaussian;
        delete Math.randomGaussian.nextGaussian;
        return (nextGaussian * standardDeviation) + mean;
    } else {
        var v1, v2, s, multiplier;
        do {
            v1 = 2 * Math.random() - 1; // between -1 and 1
            v2 = 2 * Math.random() - 1; // between -1 and 1
            s = v1 * v1 + v2 * v2;
        } while (s >= 1 || s == 0);
        multiplier = Math.sqrt(-2 * Math.log(s) / s);
        Math.randomGaussian.nextGaussian = v2 * multiplier;
        return (v1 * multiplier * standardDeviation) + mean;
    }

};

// Add a new current to the current table
function newCurrent() {
    var table = document.getElementById("CurrentTable");
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = '<input type="text" name="current_time" value="0">';
    cell2.innerHTML = '<input type="text" name="current_mean" value="400">';
    cell3.innerHTML = '<input type="text" name="current_std" value="0">';

}

// Remove the last row in the simulation table
function delCurrent(){
    document.getElementById("CurrentTable").deleteRow(-1)
}

// Simulate a leaky integrate and fire
function simulate(args) {

    var tau = args.tau // 0.020;
    var R = args.R // 3e7;
    // resting potential
    var E = args.E; // -0.070  
    // threshold for a spike
    var theta = args.theta // -0.030;
    // change in time - window
    var dt = 0.0001; //should be less than tau
    // total milliseconds to run for
    //var nSteps = 2000;
    var I = generateCurrent(3,dt)

    var dV = 0;
    var V = [];
    V[0] = E
    for (var i = 0; i < nSteps; i++) {

        dV = dt * ((E - V[i]) + (I[i] * R))/tau;
        V[i + 1] = V[i] + dV;
        if (V[i + 1] > theta) {
            V[i] = 0;
            V[i + 1] = E;
        }
    }

     var trace = [];
    var current = [];
	var time = [];

	
	trace.push('Membrane Potential Vm ')
	current.push('Current Injection I')
	
    for (var i = 0; i < nSteps; i++) {
        trace.push(V[i])
        current.push(I[i])
		time.push(i*dt)
    }
    return {
		data_trace: trace,
        data_current: current,
		data_time: time,
		data_recovery: []
    }
}


function plot_results(sim) {
    var trace      = sim.data_trace;
    var current    = sim.data_current;
    var time   	   = sim.data_time;
	var recovery   = sim.data_recovery;
    // Process traces and currents into one data stream
	

	
	var chart_current = c3.generate({
		bindto: '#chart_current',
		data: {
		  columns: [
			current
		  ]
		},
		point: {
			show: false
		},
		zoom: {
			enabled: true
		},
		axis: {
			x: {
				tick: {
						fit: false
				}
			},
			y: {
				label:'Current Injection (mA)'
			}
			
		}
	});
	
	if (recovery.length > 0){
		var chart = c3.generate({
		bindto: '#chart',
		data: {
		  columns: [
			trace,
			recovery
		  ]
		},
		point: {
			show: false
		},
		zoom: {
			enabled: true
		},
		axis: {
			x: {
				tick: {
						fit: false
					}
				},
			y: {
				label:'Membrane Potential (mV)'
			}
		}
		});	
	} else {
			var chart = c3.generate({
		bindto: '#chart',
		data: {
		  columns: [
			trace
		  ]
		},
		point: {
			show: false
		},
		zoom: {
			enabled: true
		},
		axis: {
			x: {
				tick: {
						fit: false
					}
				},
			y: {
				label:'Membrane Potential (mV)'
			}
			}
		});	
	}
	
}
	


window.onload = function () {

    // get tab container
    var container = document.getElementById("tabContainer");
    var tabcon = document.getElementById("tabscontent");
    //alert(tabcon.childNodes.item(1));
    // set current tab
    var navitem = document.getElementById("tabHeader_1");

    //store which tab we are on
    var ident = navitem.id.split("_")[1];
    //alert(ident);
    navitem.parentNode.setAttribute("data-current", ident);
    //set current tab with class of activetabheader
    navitem.setAttribute("class", "tabActiveHeader");

    //hide two tab contents we don't need
    var pages = tabcon.getElementsByTagName("div");
    for (var i = 1; i < pages.length; i++) {
        pages.item(i).style.display = "none";
    };

    //this adds click event to tabs
    var tabs = container.getElementsByTagName("li");
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = displayPage;
    }
}

// on click of one of tabs
function displayPage() {
    var current = this.parentNode.getAttribute("data-current");
    
    //remove class of activetabheader and hide old contents
    document.getElementById("tabHeader_" + current).removeAttribute("class");
    document.getElementById("tabpage_" + current).style.display = "none";

    var ident = this.id.split("_")[1];
    
    currentTab = ident;
    
    //add class of activetabheader to new active tab and show contents
    this.setAttribute("class", "tabActiveHeader");
    document.getElementById("tabpage_" + ident).style.display = "block";
    this.parentNode.setAttribute("data-current", ident);
}

function iz_model_load() {

    switch (parseInt(document.getElementById("iz_model").value)) {
        case 1: // Regular Spiking
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        case 2:
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        case 3:
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        case 4:
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        case 5:
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        case 6:
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
            break;
        default:
            // SPN model
            var iz_args = {
                C: 15,
                k: 1,
                vr: -80,
                vt: -30,
                vpeak: 40,
                a: 0.01,
                b: -20,
                c: 55,
                d: 91
            }
    }

    document.getElementById("Iz_C").value = iz_args.C;
    document.getElementById("Iz_k").value = iz_args.k;
    document.getElementById("Iz_vr").value = iz_args.vr;
    document.getElementById("Iz_vt").value = iz_args.vt;
    document.getElementById("Iz_vpeak").value = iz_args.vpeak;
    document.getElementById("Iz_a").value = iz_args.a;
    document.getElementById("Iz_b").value = iz_args.b;
    document.getElementById("Iz_c").value = iz_args.c;
    document.getElementById("Iz_d").value = iz_args.d;
    document.getElementById("Iz_tau").value = iz_args.tau;


}

function adex_model_load() {

    var params = [[59 , 2.9 , -62  , -42 , 3.0 , 1.8 ,  16  , 61  , -54 , 8.4  , 184], 
                  [83 , 1.7 , -59  , -56 , 3.0 , 2.0 ,  41  , 55  , -54 , 10.4 , 116],
                  [104, 4.3 , -65  , -52 , 5.5 ,-0.8 ,  88  , 65  , -53 , 10.4 , 98 ],
                  [200, 10  ,  -70 , -50 , 0.8 ,   2 ,  30  , 0   , -58 , 0    , 500],
                  [200, 12  ,  -70 , -50 , 2   ,   2 ,  300 , 60  , -58 , 0    , 500],
                  [130, 18  ,  -58 , -50 , 2   ,   4 ,  150 , 120 , -50 , 0    , 400],
                  [200, 10  ,  -58 , -50 , 2   ,   2 ,  120 , 100 , -46 , 0    , 210],
                  [200, 12  ,  -70 , -50 , 2   , -10 ,  300 , 0   , -58 , 0    , 300],
                  [200, 12  ,  -70 , -50 , 2   ,  -6 ,  300 , 0   , -58 , 0    , 110],
                  [100, 10  ,  -65 , -50 , 2   , -10 ,  90  , 30  , -47 , 0    , 350],
                  [100, 12  ,  -60 , -50 , 2   , -11 ,  130 , 0   , -48 , 0    , 160]]
    
    var num = parseInt(document.getElementById("adex_model").value)

    document.getElementById("Adex_C").value = params[num][0];
    document.getElementById("Adex_gl").value = params[num][1];
    document.getElementById("Adex_el").value = params[num][2];
    document.getElementById("Adex_vt").value = params[num][3];
    document.getElementById("Adex_del").value = params[num][4];
    document.getElementById("Adex_a").value = params[num][5];
    document.getElementById("Adex_tw").value = params[num][6];    
    document.getElementById("Adex_b").value = params[num][7];
    document.getElementById("Adex_vr").value = params[num][8];
}